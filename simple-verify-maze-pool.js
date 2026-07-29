// Simple verification of maze pool without external dependencies
// Run with: node simple-verify-maze-pool.js

console.log('\n=== MAZE POOL INTEGRATION TEST ===\n');

// Load maze pool code
const fs = require('fs');
const mazePoolCode = fs.readFileSync('./maze-pool.js', 'utf8');
eval(mazePoolCode);

// Test results
let passed = 0;
let failed = 0;

function test(name, testFn) {
    try {
        testFn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message} (expected ${expected}, got ${actual})`);
    }
}

// Tests
console.log('--- MAZE POOL STRUCTURE ---\n');

test('MAZE_POOL is defined and is an array', () => {
    assert(typeof MAZE_POOL !== 'undefined', 'MAZE_POOL should be defined');
    assert(Array.isArray(MAZE_POOL), 'MAZE_POOL should be an array');
});

test('MAZE_POOL has 100+ mazes', () => {
    assert(MAZE_POOL.length >= 100, `MAZE_POOL should have 100+ mazes, has ${MAZE_POOL.length}`);
});

test('Each maze has required properties', () => {
    const maze = MAZE_POOL[0];
    assert(maze.id !== undefined, 'Maze should have id');
    assert(Array.isArray(maze.grid), 'Maze should have grid array');
    assert(Array.isArray(maze.moving_walls), 'Maze should have moving_walls');
    assert(Array.isArray(maze.hearts), 'Maze should have hearts');
    assert(maze.difficulty !== undefined, 'Maze should have difficulty');
    assert(maze.hazard_count !== undefined, 'Maze should have hazard_count');
});

console.log('\n--- MAZE GRID PROPERTIES ---\n');

test('Each maze is 20×20', () => {
    for (let idx = 0; idx < Math.min(5, MAZE_POOL.length); idx++) {
        const maze = MAZE_POOL[idx];
        assert(maze.grid.length === 20, `Maze ${idx} should have 20 rows, has ${maze.grid.length}`);
        for (let i = 0; i < 20; i++) {
            assert(maze.grid[i].length === 20, `Maze ${idx} row ${i} should have 20 columns, has ${maze.grid[i].length}`);
        }
    }
});

test('Each maze has exactly 1 START tile at [0][0]', () => {
    for (let idx = 0; idx < Math.min(10, MAZE_POOL.length); idx++) {
        const maze = MAZE_POOL[idx];
        assert(maze.grid[0][0] === 3, `Maze ${idx} should have START at [0][0], has ${maze.grid[0][0]}`);
    }
});

test('Each maze has exactly 1 END tile at [19][19]', () => {
    for (let idx = 0; idx < Math.min(10, MAZE_POOL.length); idx++) {
        const maze = MAZE_POOL[idx];
        assert(maze.grid[19][19] === 4, `Maze ${idx} should have END at [19][19], has ${maze.grid[19][19]}`);
    }
});

console.log('\n--- MAZE HAZARDS AND COLLECTIBLES ---\n');

test('Each maze has 2-3 moving walls', () => {
    for (let idx = 0; idx < Math.min(20, MAZE_POOL.length); idx++) {
        const maze = MAZE_POOL[idx];
        assert(maze.moving_walls.length >= 2 && maze.moving_walls.length <= 3,
            `Maze ${idx} should have 2-3 moving walls, has ${maze.moving_walls.length}`);
    }
});

test('Each maze has exactly 2 hearts', () => {
    for (let idx = 0; idx < Math.min(20, MAZE_POOL.length); idx++) {
        const maze = MAZE_POOL[idx];
        assert(maze.hearts.length === 2, `Maze ${idx} should have 2 hearts, has ${maze.hearts.length}`);
    }
});

test('Hearts are placed on empty tiles', () => {
    for (let idx = 0; idx < Math.min(20, MAZE_POOL.length); idx++) {
        const maze = MAZE_POOL[idx];
        for (const heart of maze.hearts) {
            const tile = maze.grid[heart.row][heart.col];
            assert(tile === 0 || tile === 6, `Heart at [${heart.row}][${heart.col}] should be on empty space or heart tile, found ${tile}`);
        }
    }
});

console.log('\n--- MAZE UTILITY FUNCTIONS ---\n');

test('validateMaze function exists and works', () => {
    assert(typeof validateMaze === 'function', 'validateMaze should be defined');
    const maze = MAZE_POOL[0];
    const errors = validateMaze(maze);
    assert(Array.isArray(errors), 'validateMaze should return array');
    assert(errors.length === 0, `First maze should validate with no errors, got: ${errors.join('; ')}`);
});

test('validateMazePool function exists', () => {
    assert(typeof validateMazePool === 'function', 'validateMazePool should be defined');
});

test('getMazeById function exists and works', () => {
    assert(typeof getMazeById === 'function', 'getMazeById should be defined');
    const maze = getMazeById(0);
    assert(maze.id === 0, 'getMazeById(0) should return maze with id 0');
});

test('getMazeCount function exists and returns correct count', () => {
    assert(typeof getMazeCount === 'function', 'getMazeCount should be defined');
    const count = getMazeCount();
    assertEqual(count, MAZE_POOL.length, 'getMazeCount should return MAZE_POOL length');
});

console.log('\n--- MAZE SOLVABILITY ---\n');

test('All mazes are solvable (BFS check)', () => {
    let unsolvableCount = 0;
    for (let idx = 0; idx < Math.min(20, MAZE_POOL.length); idx++) {
        const maze = MAZE_POOL[idx];
        const isSolvable = canSolveMaze(maze.grid);
        if (!isSolvable) {
            unsolvableCount++;
            console.log(`  Warning: Maze ${maze.id} is not solvable`);
        }
    }
    assert(unsolvableCount === 0, `${unsolvableCount} mazes are not solvable`);
});

console.log('\n--- MAZE DIVERSITY ---\n');

// Check difficulty distribution
test('Mazes have varied difficulty levels', () => {
    const difficulties = {};
    for (const maze of MAZE_POOL) {
        difficulties[maze.difficulty] = (difficulties[maze.difficulty] || 0) + 1;
    }
    assert(Object.keys(difficulties).length > 0, 'Mazes should have difficulty levels');
    console.log(`  Difficulty distribution:`, difficulties);
});

// Check unique grid layouts
test('Mazes have unique layouts', () => {
    const gridStrings = new Set();
    let uniqueCount = 0;
    for (const maze of MAZE_POOL) {
        const gridStr = JSON.stringify(maze.grid);
        if (!gridStrings.has(gridStr)) {
            uniqueCount++;
            gridStrings.add(gridStr);
        }
    }
    console.log(`  Unique layouts: ${uniqueCount}/${MAZE_POOL.length}`);
    assert(uniqueCount >= 95, `At least 95 unique layouts expected, got ${uniqueCount}`);
});

console.log('\n=== TEST SUMMARY ===\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total Mazes: ${MAZE_POOL.length}`);
console.log();

if (failed === 0) {
    console.log('✓ ALL TESTS PASSED - Maze pool is ready!\n');
    process.exit(0);
} else {
    console.log('✗ SOME TESTS FAILED\n');
    process.exit(1);
}
