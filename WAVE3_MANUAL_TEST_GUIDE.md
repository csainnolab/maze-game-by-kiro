# Wave 3 Manual Test Guide

This guide provides step-by-step instructions to manually verify all three Wave 3 features are working correctly.

## Feature 1: Moving Wall Bounce-Back Logic

### Test Setup
1. Open the game in a browser
2. Start a new game (any maze)
3. Observe the purple moving walls animating on the canvas

### Test Procedure

**Test 1.1: Verify moving wall movement animation**
- Start game
- Observe purple squares (moving walls) moving back and forth
- Expected: Walls move smoothly in their configured directions
- ✓ PASS if walls animate continuously without freezing

**Test 1.2: Verify player bump when hitting moving wall**
- Play until you collide with a moving wall
- Observe player position after collision
- Expected: Player is pushed AWAY from the wall in opposite direction
- ✓ PASS if player moves away (not stays on wall)

**Test 1.3: Verify 1 damage from moving wall**
- Start with full health (5 red hearts)
- Navigate to and collide with a moving wall
- Check health display after collision
- Expected: Health decreases to 4 hearts
- ✓ PASS if health shows exactly 1 damage (5→4)

**Test 1.4: Verify bump respects grid boundaries**
- Navigate to corner of grid (e.g., position [0][0])
- Collide with moving wall
- Expected: Player stays within bounds [0-19, 0-19]
- ✓ PASS if player never appears off-grid

**Test 1.5: Verify death message for moving wall**
- Start with 1 health (use hearts strategically)
- Hit a moving wall
- Expected: Death overlay shows "Crushed by a moving wall!"
- ✓ PASS if specific death message appears

---

## Feature 2: Heart Collectible System

### Test Setup
1. Open the game in a browser
2. Identify golden heart tiles in the maze (should be 2 per maze)

### Test Procedure

**Test 2.1: Verify heart rendering and animation**
- Observe golden colored tiles in maze
- Watch them pulse/glow with animation
- Expected: Hearts have golden color (#FFD700) and pulse effect
- ✓ PASS if hearts are clearly visible with animation

**Test 2.2: Verify heart collection**
- Navigate player to a heart tile
- Move onto the heart
- Expected: Heart disappears from map
- ✓ PASS if heart is removed after moving onto it

**Test 2.3: Verify health restoration (+1)**
- Start with 3 health (use lava/moving walls to reduce)
- Collect a heart
- Check health display
- Expected: Health increases to 4
- ✓ PASS if health shows exactly +1 (3→4)

**Test 2.4: Verify health cap at 5**
- Collect a heart while at 5 health
- Check health display
- Expected: Health stays at 5 (doesn't overflow to 6)
- ✓ PASS if health remains capped at 5 hearts

**Test 2.5: Verify no recollection**
- Collect a heart
- Try to move back over that spot
- Expected: No health increase, area is now empty
- ✓ PASS if heart doesn't give health twice

**Test 2.6: Verify health display updates**
- Watch health indicator in stats bar
- Collect heart or take damage
- Expected: Heart emoji display updates immediately
- ✓ PASS if hearts (❤️/🤍) update in real-time

---

## Feature 3: Maze Pool Data Structure

### Test Setup
1. Open browser developer console (F12)
2. Open the game

### Test Procedure

**Test 3.1: Verify maze pool is loaded**
- In console, type: `console.log(MAZE_POOL.length)`
- Expected: Should output "5"
- ✓ PASS if console shows 5 mazes loaded

**Test 3.2: Verify maze validation on startup**
- Open browser console (F12)
- Reload the game page
- Expected: Console shows "Validating maze pool..." and "Maze pool validation complete: 5 valid, 0 invalid"
- ✓ PASS if all 5 mazes validate without errors

**Test 3.3: Verify maze grid structure**
- In console, type: `MAZE_POOL[0].grid.length`
- Expected: Should output "20"
- In console, type: `MAZE_POOL[0].grid[0].length`
- Expected: Should output "20"
- ✓ PASS if both dimensions are 20

**Test 3.4: Verify maze randomization**
- Play a complete maze (reach the end)
- Click "Play Again"
- Play another maze
- Expected: Maze layout is completely different (compare positions of walls)
- Repeat 5+ times
- Expected: No maze repeats back-to-back
- ✓ PASS if each maze is unique and no immediate repeats

**Test 3.5: Verify maze display counter**
- Look at stats bar
- You should see "Maze X of 5" where X changes each round
- Play through multiple mazes
- Expected: Counter shows Maze 1, then 2, 3, 4, 5, then back to different one
- ✓ PASS if maze counter displays and updates correctly

**Test 3.6: Verify maze has correct START/END positions**
- Start new game
- Player should start at top-left area (green tile)
- Goal is bottom-right area (gold tile)
- Expected: START at [0][0], END at [19][19]
- ✓ PASS if player starts at top-left, goal is bottom-right

**Test 3.7: Verify each maze has 2 hearts**
- Start new maze
- Count visible golden heart tiles
- Expected: Exactly 2 hearts per maze
- Repeat for 5 different mazes
- ✓ PASS if all mazes have exactly 2 hearts

**Test 3.8: Verify each maze has 2-3 moving walls**
- Start new maze
- Count purple squares (moving walls)
- Expected: 2 or 3 moving walls per maze
- Repeat for multiple mazes
- ✓ PASS if all mazes have 2-3 moving walls

---

## Integration Tests

**Test I.1: Complete game flow**
1. Start game
2. Collect 1 heart (+1 health)
3. Take damage from lava (-1 health)
4. Collide with moving wall, get bumped (-1 health)
5. Collect second heart (+1 health)
6. Reach goal
- Expected: Game completes, win overlay shown
- ✓ PASS if complete flow works without errors

**Test I.2: Death from moving wall**
1. Reduce health to 1 (use hazards strategically)
2. Hit moving wall
3. Expected: Death overlay shows "Crushed by a moving wall!"
- ✓ PASS if moving wall death works correctly

**Test I.3: Death from lava**
1. Start new game
2. Reduce health to 1 (collect hearts if needed, use moving walls)
3. Step on lava
4. Expected: Death overlay shows "Burned by lava!"
- ✓ PASS if lava death still works (from earlier features)

**Test I.4: Multiple round consistency**
1. Play 5 complete games in a row
2. Each game should:
   - Have a different maze
   - Have 2 hearts
   - Have moving walls
   - Allow health management
   - Result in either win or death
- ✓ PASS if all 5 games work consistently

---

## Performance Checks

**Test P.1: Rendering performance**
- Play for 5+ minutes
- Expected: Game runs smoothly at 60fps
- Check if any stuttering or frame drops occur
- ✓ PASS if no performance degradation

**Test P.2: Memory stability**
- Play 10+ complete games without refresh
- Expected: No memory leaks, game stays responsive
- ✓ PASS if game stays responsive throughout

---

## Browser Compatibility (Optional)

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

Expected: All features work on all browsers

---

## Summary Checklist

### Feature 1: Moving Walls
- [ ] Test 1.1: Moving walls animate
- [ ] Test 1.2: Player bumps away
- [ ] Test 1.3: 1 damage dealt
- [ ] Test 1.4: Boundaries respected
- [ ] Test 1.5: Death message correct

### Feature 2: Hearts
- [ ] Test 2.1: Hearts render with animation
- [ ] Test 2.2: Hearts collectable
- [ ] Test 2.3: +1 health on collection
- [ ] Test 2.4: Health capped at 5
- [ ] Test 2.5: No recollection possible
- [ ] Test 2.6: Health display updates

### Feature 3: Maze Pool
- [ ] Test 3.1: 5 mazes loaded
- [ ] Test 3.2: All mazes validate
- [ ] Test 3.3: 20×20 structure
- [ ] Test 3.4: Mazes randomize
- [ ] Test 3.5: Maze counter displays
- [ ] Test 3.6: START/END positions correct
- [ ] Test 3.7: 2 hearts per maze
- [ ] Test 3.8: 2-3 moving walls per maze

### Integration & Performance
- [ ] Test I.1: Complete game flow
- [ ] Test I.2: Moving wall death
- [ ] Test I.3: Lava death
- [ ] Test I.4: Multiple rounds consistent
- [ ] Test P.1: Performance stable
- [ ] Test P.2: Memory stable

---

## Expected Results

All tests should PASS. If any test fails:
1. Verify the implementation in game.js
2. Check browser console for errors
3. Verify maze-pool.js is loaded correctly
4. Check that index.html includes all elements

