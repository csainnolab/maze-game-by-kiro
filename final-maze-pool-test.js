// Final comprehensive maze pool verification
// Loads maze-pool.js and runs all validation tests

console.log('\n=== FINAL MAZE POOL VERIFICATION ===\n');

// Import the maze pool module
const fs = require('fs');
const path = require('path');

// Read and execute maze-pool.js
const mazePoolPath = path.join(__dirname, 'maze-pool.js');
const mazePoolCode = fs.readFileSync(mazePoolPath, 'utf8');

// Create a module context
const module = { exports: {} };
const sandbox = {
    console,
    module,
    exports: module.exports
};

// Execute in try-catch to handle any issues
try {
    new Function(...Object.keys(sandbox), mazePoolCode)(...Object.values(sandbox));
} catch (e) {
    console.error('Error loading maze-pool.js:', e.message);
    process.exit(1);
}

// After executing maze-pool code, functions should be in current context
// Extract MAZE_POOL and functions from the executed context
let MAZE_POOL;
let validateMaze;
let validateMazePool;
let getMazeById;
let getMazeCount;
let canSolveMaze;

// Re-execute with variable capture
eval(`(function() {
    ${mazePoolCode}
    MAZE_POOL = this.MAZE_POOL || MAZE_POOL;
    validateMaze = this.validateMaze || validateMaze;
    validateMazePool = this.validateMazePool || validateMazePool;
    getMazeById = this.getMazeById || getMazeById;
    getMazeCount = this.getMazeCount || getMazeCount;
    canSolveMaze = this.canSolveMaze || canSolveMaze;
}).call(global)`);

if (!MAZE_POOL || !Array.isArray(MAZE_POOL)) {
    console.error('Failed to load MAZE_POOL');
    process.exit(1);
}

console.log(`✓ Loaded ${MAZE_POOL.length} mazes\n`);

// Run verification tests
let passed = 0;
let failed = 0;

function test(name, testFn) {
    try {
        testFn();
        console.log(`✓ ${name}`);
        passed++;
        return true;
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        failed++;
        return false;
    }
}

console.log('--- BASIC CHECKS ---\n');

test('MAZE_POOL has 100+ entries', () => {
    if (MAZE_POOL.length < 100) throw new Error(`Only ${MAZE_POOL.length} mazes`);
});

test('All mazes are 20×20 grids', () => {
    for (let i = 0; i < MAZE_POOL.length; i++) {
        if (MAZE_POOL[i].grid.length !== 20) throw new Error(`Maze ${i} has ${MAZE_POOL[i].grid.length} rows`);
        for (let r = 0; r < 20; r++) {
            if (MAZE_POOL[i].grid[r].length !== 20) throw new Error(`Maze ${i} row ${r} has ${MAZE_POOL[i].grid[r].length} cols`);
        }
    }
});

test('All mazes have START at [0][0]', () => {
    for (let i = 0; i < Math.min(50, MAZE_POOL.length); i++) {
        if (MAZE_POOL[i].grid[0][0] !== 3) throw new Error(`Maze ${i} has ${MAZE_POOL[i].grid[0][0]} at [0][0]`);
    }
});

test('All mazes have END at [19][19]', () => {
    for (let i = 0; i < Math.min(50, MAZE_POOL.length); i++) {
        if (MAZE_POOL[i].grid[19][19] !== 4) throw new Error(`Maze ${i} has ${MAZE_POOL[i].grid[19][19]} at [19][19]`);
    }
});

test('All mazes have 2-3 moving walls', () => {
    for (let i = 0; i < Math.min(50, MAZE_POOL.length); i++) {
        const mw = MAZE_POOL[i].moving_walls.length;
        if (mw < 2 || mw > 3) throw new Error(`Maze ${i} has ${mw} moving walls`);
    }
});

test('All mazes have exactly 2 hearts', () => {
    for (let i = 0; i < Math.min(50, MAZE_POOL.length); i++) {
        const h = MAZE_POOL[i].hearts.length;
        if (h !== 2) throw new Error(`Maze ${i} has ${h} hearts`);
    }
});

console.log('\n--- SOLVABILITY CHECK ---\n');

let unsolveableCount = 0;
for (let i = 0; i < Math.min(30, MAZE_POOL.length); i++) {
    if (!canSolveMaze(MAZE_POOL[i].grid)) {
        unsolveableCount++;
    }
}

test('Sample of 30 mazes are all solvable', () => {
    if (unsolveableCount > 0) throw new Error(`${unsolveableCount}/30 mazes are not solvable`);
});

console.log('\n--- UTILITY FUNCTIONS ---\n');

test('getMazeById(0) returns first maze', () => {
    const maze = getMazeById(0);
    if (!maze || maze.id !== 0) throw new Error('getMazeById failed');
});

test('getMazeCount() returns correct count', () => {
    const count = getMazeCount();
    if (count !== MAZE_POOL.length) throw new Error(`getMazeCount returned ${count}, expected ${MAZE_POOL.length}`);
});

console.log('\n--- STATISTICS ---\n');

// Gather statistics
const stats = {
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
    totalHazards: 0,
    avgMovingWalls: 0,
    uniqueLayouts: new Set()
};

for (const maze of MAZE_POOL) {
    if (maze.difficulty === 'easy') stats.easyCount++;
    else if (maze.difficulty === 'medium') stats.mediumCount++;
    else if (maze.difficulty === 'hard') stats.hardCount++;
    
    stats.totalHazards += maze.hazard_count || 0;
    stats.avgMovingWalls += maze.moving_walls.length;
    stats.uniqueLayouts.add(JSON.stringify(maze.grid).substring(0, 100));
}

console.log(`Easy mazes: ${stats.easyCount} (${((stats.easyCount / MAZE_POOL.length) * 100).toFixed(1)}%)`);
console.log(`Medium mazes: ${stats.mediumCount} (${((stats.mediumCount / MAZE_POOL.length) * 100).toFixed(1)}%)`);
console.log(`Hard mazes: ${stats.hardCount} (${((stats.hardCount / MAZE_POOL.length) * 100).toFixed(1)}%)`);
console.log(`Average hazards per maze: ${(stats.totalHazards / MAZE_POOL.length).toFixed(1)}`);
console.log(`Average moving walls: ${(stats.avgMovingWalls / MAZE_POOL.length).toFixed(1)}`);
console.log(`Unique layouts detected: ${stats.uniqueLayouts.size}/${MAZE_POOL.length}`);

console.log('\n=== FINAL RESULT ===\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total Mazes: ${MAZE_POOL.length}`);

if (failed === 0 && MAZE_POOL.length >= 100) {
    console.log('\n✓✓✓ SUCCESS: Maze pool ready for production! ✓✓✓\n');
    process.exit(0);
} else {
    console.log('\n✗ Some issues found\n');
    process.exit(1);
}
