// Test script for maze-pool.js
// Run with: node test-maze-pool.js

// Load maze-pool functions
const fs = require('fs');
const mazePoolCode = fs.readFileSync('./maze-pool.js', 'utf8');

// Create a wrapper to suppress immediate validation
const wrappedCode = mazePoolCode.replace(
    'if (typeof validateMazePool === \'function\') {\n    validateMazePool();\n}',
    '// Validation moved to test'
);

// Execute maze pool code in current context
eval(wrappedCode);

console.log('\n=== MAZE POOL GENERATION TEST ===\n');

console.log(`Total mazes generated: ${MAZE_POOL.length}`);
console.log(`Expected: 100+ mazes`);

if (MAZE_POOL.length >= 100) {
    console.log('✓ Maze pool meets minimum size requirement (100+)\n');
} else {
    console.log(`✗ Maze pool too small: ${MAZE_POOL.length} < 100\n`);
}

// Test first 5 mazes in detail
console.log('=== DETAILED MAZE VALIDATION ===\n');

for (let i = 0; i < Math.min(5, MAZE_POOL.length); i++) {
    const maze = MAZE_POOL[i];
    console.log(`Maze ${maze.id}:`);
    console.log(`  Grid: 20×20? ${maze.grid.length === 20 && maze.grid[0].length === 20 ? '✓' : '✗'}`);
    console.log(`  Pattern: ${maze.pattern}`);
    console.log(`  Difficulty: ${maze.difficulty}`);
    console.log(`  Hazard count: ${maze.hazard_count}`);
    console.log(`  Moving walls: ${maze.moving_walls.length}`);
    console.log(`  Hearts: ${maze.hearts.length}`);
    
    // Check for START and END
    let hasStart = false, hasEnd = false;
    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 20; c++) {
            if (maze.grid[r][c] === 3) hasStart = true;
            if (maze.grid[r][c] === 4) hasEnd = true;
        }
    }
    console.log(`  Has START (3)? ${hasStart ? '✓' : '✗'}`);
    console.log(`  Has END (4)? ${hasEnd ? '✓' : '✗'}`);
    console.log(`  Solvable? ${canSolveMaze(maze.grid) ? '✓' : '✗'}`);
    console.log();
}

// Statistics
console.log('=== MAZE STATISTICS ===\n');

const stats = {
    easy: 0,
    medium: 0,
    hard: 0,
    patterns: {},
    avgHazards: 0,
    totalHazards: 0
};

for (const maze of MAZE_POOL) {
    stats[maze.difficulty]++;
    stats.patterns[maze.pattern] = (stats.patterns[maze.pattern] || 0) + 1;
    stats.totalHazards += maze.hazard_count;
}

console.log(`Easy: ${stats.easy} (${((stats.easy/MAZE_POOL.length)*100).toFixed(1)}%)`);
console.log(`Medium: ${stats.medium} (${((stats.medium/MAZE_POOL.length)*100).toFixed(1)}%)`);
console.log(`Hard: ${stats.hard} (${((stats.hard/MAZE_POOL.length)*100).toFixed(1)}%)`);
console.log();

console.log('Pattern distribution:');
for (const [pattern, count] of Object.entries(stats.patterns)) {
    console.log(`  ${pattern}: ${count} (${((count/MAZE_POOL.length)*100).toFixed(1)}%)`);
}
console.log();

console.log(`Average hazards per maze: ${(stats.totalHazards/MAZE_POOL.length).toFixed(1)}`);
console.log();

// Uniqueness check
console.log('=== UNIQUENESS CHECK ===\n');

const gridStrings = new Set();
let duplicates = 0;

for (const maze of MAZE_POOL) {
    const gridStr = JSON.stringify(maze.grid);
    if (gridStrings.has(gridStr)) {
        duplicates++;
    } else {
        gridStrings.add(gridStr);
    }
}

console.log(`Unique mazes: ${gridStrings.size}/${MAZE_POOL.length}`);
console.log(`Duplicates: ${duplicates}`);

if (duplicates === 0) {
    console.log('✓ All mazes are unique\n');
} else {
    console.log(`✗ Found ${duplicates} duplicate mazes\n`);
}

// Random maze sample
console.log('=== RANDOM MAZE SAMPLES ===\n');

for (let sample = 0; sample < 3; sample++) {
    const idx = Math.floor(Math.random() * MAZE_POOL.length);
    const maze = MAZE_POOL[idx];
    console.log(`Sample ${sample + 1} - Maze ${maze.id} (${maze.difficulty}):`);
    console.log(`  Moving walls: ${maze.moving_walls.length}`);
    console.log(`  Hearts at: ${maze.hearts.map(h => `(${h.row},${h.col})`).join(', ')}`);
    console.log(`  Solvable: ${canSolveMaze(maze.grid) ? '✓' : '✗'}`);
    console.log();
}

// Validation summary
console.log('=== FINAL VALIDATION ===\n');

let validCount = 0;
let invalidCount = 0;

for (const maze of MAZE_POOL) {
    const errors = validateMaze(maze);
    if (errors.length === 0) {
        validCount++;
    } else {
        invalidCount++;
        if (invalidCount <= 3) { // Show first 3 errors
            console.error(`Maze ${maze.id} errors: ${errors.join(', ')}`);
        }
    }
}

console.log(`Valid mazes: ${validCount}/${MAZE_POOL.length}`);
console.log(`Invalid mazes: ${invalidCount}/${MAZE_POOL.length}`);
console.log();

if (invalidCount === 0 && MAZE_POOL.length >= 100) {
    console.log('✓ ALL CHECKS PASSED - Maze pool is ready for use!\n');
} else {
    console.log('✗ Some checks failed - Review errors above\n');
}
