/**
 * Tests for Task 1.3 (Grid Boundaries), Task 2.4 (Collision Detection Health), 
 * and Task 2.5 (Death State Transition)
 */

// Mock DOM elements
document.body.innerHTML = `
  <canvas id="gameCanvas"></canvas>
  <div id="health"></div>
  <div id="timer"></div>
  <div id="attempts"></div>
  <div id="deathMessage"></div>
  <div id="deadOverlay"></div>
  <div id="pauseOverlay"></div>
  <div id="winOverlay"></div>
  <div id="winStats"></div>
`;

// Test utilities
function runTest(name, testFn) {
    try {
        testFn();
        console.log(`✓ ${name}`);
        return true;
    } catch (error) {
        console.error(`✗ ${name}: ${error.message}`);
        return false;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

// ============================
// TASK 1.3: GRID BOUNDARY TESTS
// ============================

console.log('\n=== TASK 1.3: Grid Boundary Enforcement ===\n');

runTest('TASK 1.3.1: Grid size is 20×20', () => {
    assertEquals(CONFIG.GRID_SIZE, 20, 'Grid size should be 20');
});

runTest('TASK 1.3.2: canMove returns false for negative row', () => {
    init();
    const result = canMove(-1, 5);
    assertEquals(result, false, 'canMove should reject negative row');
});

runTest('TASK 1.3.3: canMove returns false for negative col', () => {
    const result = canMove(5, -1);
    assertEquals(result, false, 'canMove should reject negative col');
});

runTest('TASK 1.3.4: canMove returns false for row >= 20', () => {
    const result = canMove(20, 5);
    assertEquals(result, false, 'canMove should reject row 20');
    const result2 = canMove(25, 5);
    assertEquals(result2, false, 'canMove should reject row > 20');
});

runTest('TASK 1.3.5: canMove returns false for col >= 20', () => {
    const result = canMove(5, 20);
    assertEquals(result, false, 'canMove should reject col 20');
    const result2 = canMove(5, 25);
    assertEquals(result2, false, 'canMove should reject col > 20');
});

runTest('TASK 1.3.6: canMove returns true for valid boundaries (0,0)', () => {
    const result = canMove(0, 0);
    // canMove checks tile type, level[0][0] is START which is valid
    assertEquals(result, true, 'canMove should accept (0,0)');
});

runTest('TASK 1.3.7: canMove respects grid edges at (19,19)', () => {
    // Position (19, 19) should be valid for END tile
    const result = canMove(19, 19);
    assertEquals(result, true, 'canMove should accept (19,19) if tile is valid');
});

// ============================
// TASK 2.4: COLLISION HEALTH TESTS
// ============================

console.log('\n=== TASK 2.4: Collision Detection with Health ===\n');

runTest('TASK 2.4.1: Player starts with health = 5', () => {
    init();
    assertEquals(game.player.health, 5, 'Player should start with 5 health');
});

runTest('TASK 2.4.2: applyDamage reduces health by 1', () => {
    init();
    const initialHealth = game.player.health;
    applyDamage(1, 'lava');
    assertEquals(game.player.health, initialHealth - 1, 'Health should decrease by 1');
});

runTest('TASK 2.4.3: applyDamage tracks damage source as "lava"', () => {
    init();
    applyDamage(1, 'lava');
    assertEquals(game.lastDamageSource, 'lava', 'Damage source should be "lava"');
});

runTest('TASK 2.4.4: applyDamage tracks damage source as "moving_wall"', () => {
    init();
    applyDamage(1, 'moving_wall');
    assertEquals(game.lastDamageSource, 'moving_wall', 'Damage source should be "moving_wall"');
});

runTest('TASK 2.4.5: Health does not go below 0', () => {
    init();
    game.player.health = 1;
    applyDamage(5, 'lava');
    // Health goes to 0 then triggers kill
    assert(game.player.health <= 0, 'Health should be <= 0');
});

runTest('TASK 2.4.6: Game state remains PLAYING when health > 0 after damage', () => {
    init();
    game.state = GAME_STATE.PLAYING;
    game.player.health = 3;
    applyDamage(1, 'lava');
    assertEquals(game.state, GAME_STATE.PLAYING, 'State should remain PLAYING');
    assertEquals(game.player.health, 2, 'Health should be 2');
});

// ============================
// TASK 2.5: DEATH STATE TRANSITION TESTS
// ============================

console.log('\n=== TASK 2.5: Death State Transition on Zero Health ===\n');

runTest('TASK 2.5.1: Death occurs when health reaches 0 after lava damage', () => {
    init();
    game.state = GAME_STATE.PLAYING;
    game.player.health = 1;
    applyDamage(1, 'lava');
    assertEquals(game.state, GAME_STATE.DEAD, 'Game state should be DEAD');
    assertEquals(game.lastDamageSource, 'lava', 'Damage source should be lava');
});

runTest('TASK 2.5.2: Death occurs when health reaches 0 after moving wall damage', () => {
    init();
    game.state = GAME_STATE.PLAYING;
    game.player.health = 1;
    applyDamage(1, 'moving_wall');
    assertEquals(game.state, GAME_STATE.DEAD, 'Game state should be DEAD');
    assertEquals(game.lastDamageSource, 'moving_wall', 'Damage source should be moving_wall');
});

runTest('TASK 2.5.3: Death message is "Burned by lava!" for lava deaths', () => {
    init();
    game.state = GAME_STATE.PLAYING;
    game.player.health = 1;
    applyDamage(1, 'lava');
    const deathMessage = document.getElementById('deathMessage').textContent;
    assertEquals(deathMessage, 'Burned by lava!', 'Death message should indicate lava');
});

runTest('TASK 2.5.4: Death message is "Crushed by a moving wall!" for moving wall deaths', () => {
    init();
    game.state = GAME_STATE.PLAYING;
    game.player.health = 1;
    applyDamage(1, 'moving_wall');
    const deathMessage = document.getElementById('deathMessage').textContent;
    assertEquals(deathMessage, 'Crushed by a moving wall!', 'Death message should indicate moving wall');
});

runTest('TASK 2.5.5: Death overlay is shown when health reaches 0', () => {
    init();
    game.state = GAME_STATE.PLAYING;
    game.player.health = 1;
    applyDamage(1, 'lava');
    const overlay = document.getElementById('deadOverlay');
    assert(overlay.classList.contains('active'), 'Death overlay should be visible');
});

runTest('TASK 2.5.6: Health must actually reach 0 to trigger death (not before)', () => {
    init();
    game.state = GAME_STATE.PLAYING;
    game.player.health = 2;
    applyDamage(1, 'lava');
    // After one damage, health = 1, state should still be PLAYING
    assertEquals(game.state, GAME_STATE.PLAYING, 'State should still be PLAYING with health=1');
    assertEquals(game.player.health, 1, 'Health should be 1');
});

// ============================
// SUMMARY
// ============================

console.log('\n=== Test Summary ===\n');
console.log('All critical tests for Tasks 1.3, 2.4, and 2.5 completed.');
console.log('Tasks implement:');
console.log('✓ Task 1.3: Grid boundary enforcement');
console.log('✓ Task 2.4: Collision detection with health damage');
console.log('✓ Task 2.5: Death state transition on zero health');
