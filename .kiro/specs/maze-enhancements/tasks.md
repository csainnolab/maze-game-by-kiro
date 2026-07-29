# Implementation Plan: Maze Game Enhancements

## Overview

This implementation plan breaks down the maze game enhancement feature into discrete, incremental tasks. The plan follows a phased approach:

1. **Foundation**: Update grid configuration and canvas scaling for 20×20 support
2. **Health System**: Implement health tracking, UI, and death conditions
3. **Collision Redesign**: Change lava/moving walls from instant-death to damage-based with feedback
4. **Collectibles**: Add heart tiles and collection mechanics
5. **Maze Infrastructure**: Create preset maze pool (100+) with validation
6. **Randomization**: Implement maze selection with repeat prevention
7. **UI Polish**: Update HUD displays and feedback animations
8. **Input Prevention**: Add event.preventDefault() for keyboard controls
9. **Testing**: Write property-based tests for correctness properties

Each task includes acceptance criteria, dependencies, and effort estimates. Property tests are included as sub-tasks and marked as optional (*) for faster MVP iteration.

## Tasks

- [x] Phase 1: Foundation - Grid Expansion to 20×20

  - [x] 1.1 Update grid configuration to 20×20
    - Update CONFIG.GRID_SIZE from 10 to 20 in game.js
    - Update canvas sizing: 20 × 40px = 800px × 800px canvas
    - Verify CONFIG.TILE_SIZE remains 40px
    - Test that canvas displays correctly at 800×800 pixels
    - _Requirements: 1.1, 1.2_
    - _Effort: 10 minutes_

  - [x] 1.2 Create initial 20×20 test maze
    - Create a valid 20×20 LEVEL array with START at (0,0) and END at (19,19)
    - Include walls, lava, and moving walls appropriately distributed
    - Ensure maze passes BFS validation (solvable path exists)
    - Replace current 10×10 LEVEL in game.js
    - Test that player can move from start to end without collisions blocking path
    - _Requirements: 1.3, 1.4_
    - _Effort: 30 minutes_

  - [x] 1.3 Verify grid boundary enforcement
    - Test player cannot move left/up from grid edge
    - Test player cannot move right/down from grid edge at (19,19)
    - Verify all boundary conditions return false from canMove() function
    - _Requirements: 1.4_
    - _Effort: 15 minutes_

  - [ ]* 1.4 Write property test for grid boundaries
    - **Property 1: Grid Boundaries**
    - **Validates: Requirements 1.4**
    - Generate 100+ random starting positions and directions
    - Verify resulting position always stays within bounds [0,19] × [0,19]
    - Include edge cases: corners, edges, center positions
    - _Effort: 30 minutes_

- [x] Phase 2: Health System Implementation

  - [x] 2.1 Add health property to player object
    - Add player.health property initialized to 5
    - Initialize health to 5 when setupLevel() is called
    - Reset health to 5 in restart() and playAgain() functions
    - Verify game.player has { row, col, health } structure
    - _Requirements: 3.1_
    - _Effort: 10 minutes_

  - [x] 2.2 Create health display UI element
    - Add health display section to HTML (index.html stats bar)
    - Create 5 heart icons (using ❤️ emoji or SVG elements)
    - Position health display in stats-bar near timer
    - Apply red/pink styling to heart icons
    - Style filled hearts differently from empty hearts
    - _Requirements: 9.1, 9.4_
    - _Effort: 20 minutes_

  - [x] 2.3 Implement health display update function
    - Create updateHealthDisplay() function in game.js
    - Takes game.player.health as input
    - Shows N filled hearts and (5-N) empty hearts in DOM
    - Call this function whenever health changes
    - Verify display updates on page load and during state changes
    - _Requirements: 9.2, 9.3_
    - _Effort: 20 minutes_

  - [x] 2.4 Modify collision detection to check health
    - Update checkCollisions() to apply damage instead of instant kill
    - Track damage source (lava vs moving wall)
    - Apply health reduction: health -= damageDealt
    - Check if health <= 0 after damage
    - Only transition to DEAD if health reaches 0
    - _Requirements: 3.2, 3.3, 3.4_
    - _Effort: 20 minutes_

  - [x] 2.5 Implement death state transition on zero health
    - When player.health reaches 0, set game.state = GAME_STATE.DEAD
    - Call kill() function with appropriate death message
    - Display overlay with context (lava vs moving wall)
    - Verify death does not occur until health actually reaches 0
    - _Requirements: 3.4, 11.1, 11.2_
    - _Effort: 15 minutes_

  - [ ]* 2.6 Write property test for health damage on lava
    - **Property 2: Health Damage on Lava Contact**
    - **Validates: Requirements 3.2, 4.1, 4.3**
    - Generate 100+ random health values (1-5) and random player positions on lava
    - Verify health decreases by exactly 1
    - Verify game state remains PLAYING if health > 0
    - _Effort: 30 minutes_

  - [ ]* 2.7 Write property test for health damage on moving wall
    - **Property 3: Health Damage on Moving Wall Contact**
    - **Validates: Requirements 3.3, 5.1**
    - Generate 100+ random health values (1-5) and moving wall collisions
    - Verify health decreases by exactly 1
    - Verify game state remains PLAYING if health > 0
    - _Effort: 30 minutes_

  - [ ]* 2.8 Write property test for health cap at 5
    - **Property 4: Health Never Exceeds Maximum**
    - **Validates: Requirements 3.7, 6.4**
    - Generate 100+ random health values and heart collection attempts
    - Verify health never exceeds 5 after collection
    - Verify health = min(current + 1, 5)
    - _Effort: 30 minutes_

  - [ ]* 2.9 Write property test for death on zero health
    - **Property 8: Death on Zero Health**
    - **Validates: Requirements 3.4, 4.4, 5.5, 11.1**
    - Generate 100+ sequences of damage events reducing health to 0
    - Verify game state transitions to DEAD
    - Verify transition is immediate and consistent
    - _Effort: 30 minutes_

- [ ] Phase 3: Collision System Redesign - Non-Lethal Hazards

  - [~] 3.1 Implement lava damage mechanics
    - Change lava collision to apply 1 damage instead of kill()
    - Keep player position ON the lava tile (no displacement)
    - Update checkCollisions() to detect lava and apply damage
    - Set damage cause to "lava" for death message
    - Verify player remains playable after lava contact if health > 0
    - _Requirements: 4.1, 4.2, 4.3_
    - _Effort: 20 minutes_

  - [~] 3.2 Implement moving wall bounce-back logic
    - Calculate bump-back direction opposite to wall movement direction
    - Implement bouncePlayerBack(wall) function
    - Calculate new position: 1 tile away from wall in opposite direction
    - Clamp bounced position to grid bounds [0,19] × [0,19]
    - Apply 1 damage when moving wall is contacted
    - Verify player doesn't move off grid when bumped from edge
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
    - _Effort: 25 minutes_

  - [~] 3.3 Create collision feedback animation
    - Implement brief flash/flicker animation on collision (200ms max)
    - Draw color overlay or blink effect at collision point
    - Trigger animation in checkCollisions() when damage is applied
    - Ensure animation doesn't disrupt gameplay or input handling
    - Test animation plays at 60fps without frame drops
    - _Requirements: 5.6, 12.1, 12.2, 12.4_
    - _Effort: 30 minutes_

  - [~] 3.4 Update death messages for different hazards
    - Check damage source (lava vs moving wall) in kill() function
    - Display "Burned by lava!" for lava deaths
    - Display "Crushed by a moving wall!" for moving wall deaths
    - Display "Out of health!" for cumulative damage deaths
    - Verify message appears in death overlay
    - _Requirements: 11.2, 11.3_
    - _Effort: 15 minutes_

  - [ ]* 3.5 Write property test for lava position preservation
    - **Property 5: Lava Position Preservation**
    - **Validates: Requirements 4.2**
    - Generate 100+ random lava tile positions
    - After lava collision, verify player position equals lava tile position
    - Verify no displacement occurs
    - _Effort: 25 minutes_

  - [ ]* 3.6 Write property test for moving wall bump-back direction
    - **Property 6: Moving Wall Bump-Back Direction**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - Generate 100+ moving wall collisions with various directions
    - Verify bumped position is adjacent to wall in opposite direction
    - Verify bumped position remains within grid bounds
    - _Effort: 35 minutes_

- [ ] Phase 4: Heart Collectible System

  - [x] 4.1 Add HEART tile type to constants
    - Add TILE.HEART = 6 constant to TILE object
    - Ensure no conflicts with existing tile types (0-5)
    - Verify constant is accessible throughout game.js
    - _Requirements: 6.1_
    - _Effort: 5 minutes_

  - [~] 4.2 Implement heart collection in collision detection
    - Add heart tile rendering in drawTiles() function
    - Use distinct color (golden/yellow with animation)
    - Track hearts array in game object
    - Initialize hearts array from current maze
    - _Requirements: 6.1, 6.4_
    - _Effort: 20 minutes_

  - [~] 4.3 Implement heart collection logic
    - Create collectHeart(row, col) function
    - Remove heart from hearts array after collection
    - Increase player.health by 1 (capped at 5)
    - Call updateHealthDisplay() after collection
    - Verify heart only collects once (can't recollect)
    - _Requirements: 6.3, 6.4, 6.5_
    - _Effort: 20 minutes_

  - [~] 4.4 Add heart collection feedback animation
    - Display "+1 Health" text at heart collection point
    - Brief animation floating upward and fading
    - Highlight heart icon in UI on collection
    - Animation lasts ~500ms without disrupting gameplay
    - Verify feedback triggers on every valid collection
    - _Requirements: 6.6, 9.5_
    - _Effort: 25 minutes_

  - [~] 4.5 Prevent health increase above 5 maximum
    - When player.health === 5 and collects heart
    - Heart still removes from maze
    - Health remains at 5 (no overflow)
    - "+1 Health" animation still displays (or "Max Health!" variant)
    - Verify max cap is enforced consistently
    - _Requirements: 3.7, 6.5_
    - _Effort: 15 minutes_

  - [ ]* 4.6 Write property test for heart collection removal
    - **Property 7: Heart Collection Removes Collectible**
    - **Validates: Requirements 6.3**
    - Generate 100+ heart collection events at random positions
    - Verify heart is removed from hearts array after collection
    - Verify heart doesn't appear in render after collection
    - _Effort: 25 minutes_

  - [ ]* 4.7 Write unit tests for heart system edge cases
    - Test heart collection at max health (5)
    - Test heart collection at min health (1)
    - Test collecting both hearts in a maze
    - Test health stays capped at 5 after multiple collections
    - Test "+1 Health" animation appears correctly
    - _Effort: 30 minutes_

- [ ] Phase 5: Preset Maze Pool Creation

  - [~] 5.1 Create maze pool data structure
    - Define MAZE_POOL as array of 100+ maze objects
    - Each object contains: id, grid (20×20), moving_walls, hearts, difficulty
    - Create new file maze-pool.js or embed in game.js
    - Ensure all 100+ mazes are loaded at game startup
    - Verify load time < 1 second
    - _Requirements: 7.1, 8.1, 8.2_
    - _Effort: 60 minutes_

  - [~] 5.2 Design and generate 100+ preset mazes
    - Create 100+ unique 20×20 maze configurations by hand-design or algorithm
    - Each maze must have:
      - Exactly 1 START tile (green)
      - Exactly 1 END tile (gold)
      - 2-3 MOVING_WALL tiles
      - Multiple LAVA sections
      - 2 HEART tiles positioned strategically
      - Multiple walls creating challenge
    - Vary difficulty: easy, medium, hard variants
    - Ensure strategic heart placement near hazards
    - _Requirements: 8.2, 8.3, 8.4_
    - _Effort: 240 minutes (4 hours - this is a significant task)_

  - [~] 5.3 Implement maze validation function
    - Create validateMaze(maze) function
    - Check maze is 20×20 grid (400 tiles)
    - Verify exactly 1 START and 1 END tile
    - Verify 2-3 MOVING_WALL tiles
    - Verify 2 HEART tiles
    - Run BFS to confirm solvable path from START to END
    - Log validation errors for debugging
    - _Requirements: 7.5, 7.6_
    - _Effort: 40 minutes_

  - [~] 5.4 Validate all 100+ mazes before loading
    - Loop through MAZE_POOL and validate each maze
    - Halt game startup if any maze fails validation
    - Display console error with maze ID and failure reason
    - Create validation report (can be logged to console)
    - Ensure all 100+ mazes pass validation before proceeding
    - _Requirements: 7.5, 7.6_
    - _Effort: 20 minutes_

  - [ ]* 5.5 Write property test for maze grid dimensions
    - **Property 9: Maze Grid Dimensions**
    - **Validates: Requirements 1.1, 8.1**
    - Test each of 100+ preset mazes
    - Verify grid is exactly 20×20 (400 tiles)
    - _Effort: 20 minutes_

  - [ ]* 5.6 Write property test for maze tile count
    - **Property 10: Maze Tile Count**
    - **Validates: Requirements 6.2, 8.2**
    - Test each of 100+ preset mazes
    - Verify exactly 2 HEART tiles per maze
    - Verify exactly 1 START, 1 END, 2-3 MOVING_WALLs
    - _Effort: 25 minutes_

  - [ ]* 5.7 Write property test for maze solvability
    - **Property 12: Maze Solvability**
    - **Validates: Requirements 7.5, 7.6**
    - Test each of 100+ preset mazes with BFS validation
    - Verify valid path exists from START to END
    - Test that BFS algorithm correctly identifies obstacles
    - _Effort: 35 minutes_

- [ ] Phase 6: Maze Randomization and Selection

  - [~] 6.1 Implement maze selection logic
    - Create selectMaze() function
    - Randomly select maze index from MAZE_POOL (0-99)
    - Store current maze index in game.currentMazeIndex
    - Store previous maze index to prevent repeats
    - Return selected maze configuration
    - _Requirements: 7.2_
    - _Effort: 15 minutes_

  - [~] 6.2 Implement repeat prevention
    - Modify selectMaze() to check previous maze index
    - If random selection equals previous maze, reroll until different
    - Store previous maze in game.previousMazeIndex
    - Update previous maze after each level completes
    - Verify no immediate back-to-back maze repeats
    - _Requirements: 7.4_
    - _Effort: 20 minutes_

  - [~] 6.3 Load selected maze into game state
    - Modify setupLevel() to accept maze object from MAZE_POOL
    - Copy maze.grid into game.level
    - Initialize moving walls from maze.moving_walls
    - Initialize hearts from maze.hearts
    - Call on game start and restart
    - Verify all maze data loads correctly
    - _Requirements: 7.2, 7.3_
    - _Effort: 20 minutes_

  - [~] 6.4 Integrate random maze selection into game flow
    - In init(): Call selectMaze() before setupLevel()
    - In restart(): Call selectMaze() to get new maze
    - In playAgain(): Call selectMaze() to get new maze
    - Update game.previousMazeIndex after level ends
    - Verify new random maze loads on each level
    - _Requirements: 7.2, 7.3_
    - _Effort: 15 minutes_

  - [ ]* 6.5 Write property test for no immediate repeats
    - **Property 13: No Immediate Maze Repeats**
    - **Validates: Requirements 7.4**
    - Generate 100+ consecutive maze selections
    - Verify current maze index never equals previous maze index
    - Test edge cases: maze 0, maze 99, random sequence
    - _Effort: 30 minutes_

- [ ] Phase 7: UI Updates and Display

  - [~] 7.1 Add maze identifier to stats bar
    - Add "Maze X of 100" display to stats-bar in HTML
    - Create formatMazeId(current, total) function
    - Display current maze index + 1 and total (100)
    - Position next to attempts counter
    - Style with same color scheme as other stats
    - _Requirements: 10.1, 10.2_
    - _Effort: 20 minutes_

  - [~] 7.2 Implement maze identifier update function
    - Create updateMazeDisplay() function
    - Takes game.currentMazeIndex as input
    - Updates DOM with "Maze (index+1) of 100" text
    - Call this function on maze selection and after restart
    - Verify maze ID updates whenever new maze is selected
    - _Requirements: 10.3, 10.4_
    - _Effort: 15 minutes_

  - [~] 7.3 Create collision feedback visual effects
    - When player hits lava: Orange color flash at player position
    - When player hit moving wall: Purple color flash at player position
    - Flash lasts 100-200ms without blocking input
    - Implement using canvas overlay or color modification
    - Verify feedback doesn't impact framerate
    - _Requirements: 12.1, 12.3, 12.4_
    - _Effort: 25 minutes_

  - [~] 7.4 Update death message display
    - Ensure death overlay shows context-specific message
    - "Burned by lava!" for lava deaths
    - "Crushed by a moving wall!" for moving wall deaths
    - "Out of health!" as fallback
    - Style death message prominently in overlay
    - _Requirements: 11.2, 11.3_
    - _Effort: 10 minutes_

- [ ] Phase 8: Input Event Prevention

  - [~] 8.1 Add preventDefault to directional keys
    - In handleKeyDown(): Add event.preventDefault() for W, A, S, D
    - In handleKeyDown(): Add event.preventDefault() for arrow keys
    - Ensure page doesn't scroll when playing game
    - Preserve normal browser behavior for non-game keys
    - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
    - _Requirements: 2.1, 2.2_
    - _Effort: 15 minutes_

  - [~] 8.2 Add preventDefault to action keys
    - In handleKeyDown(): Add event.preventDefault() for ESC (pause)
    - In handleKeyDown(): Add event.preventDefault() for R (restart)
    - Prevent default browser shortcuts from interfering
    - Verify page behavior remains normal for other keys
    - _Requirements: 2.1, 2.4_
    - _Effort: 10 minutes_

  - [~] 8.3 Test event prevention across browsers
    - Test WASD and arrow keys on Chrome (no scroll)
    - Test WASD and arrow keys on Firefox (no scroll)
    - Test WASD and arrow keys on Safari (no scroll)
    - Test WASD and arrow keys on Edge (no scroll)
    - Test that other page scrolling still works normally
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
    - _Effort: 20 minutes_

- [ ] Phase 9: Checkpoint - Verify All Components

  - [~] 9.1 Checkpoint - Run all unit and integration tests
    - Ensure all tests from earlier phases pass
    - Verify health system works end-to-end
    - Verify collision detection triggers properly
    - Verify maze loading and randomization works
    - Verify UI updates display correctly
    - Run manual smoke tests: complete 3 mazes with different paths
    - Ask user if questions arise about any implementation decisions

- [ ] Phase 10: Comprehensive Testing Suite

  - [ ]* 10.1 Write comprehensive unit tests for health system
    - Test health initialization to 5
    - Test health decreases by 1 on lava
    - Test health decreases by 1 on moving wall
    - Test health stays capped at 5 after heart collection
    - Test health transitions to DEAD at 0
    - Test health resets to 5 on restart
    - _Requirements: 3.1-3.7_
    - _Effort: 40 minutes_

  - [ ]* 10.2 Write comprehensive unit tests for collision system
    - Test lava damage applies correctly
    - Test moving wall bounce-back direction
    - Test moving wall bump position respects boundaries
    - Test heart collection removes heart
    - Test heart collection increases health (capped at 5)
    - Test death condition triggers at health = 0
    - _Requirements: 4.1-4.4, 5.1-5.6, 6.1-6.7_
    - _Effort: 45 minutes_

  - [ ]* 10.3 Write integration tests for full game flow
    - Test complete game from start to win
    - Test health management across full maze
    - Test collecting hearts mid-game
    - Test maze randomization between rounds
    - Test death and restart flow
    - Test pause/resume maintains game state
    - _Requirements: All requirements_
    - _Effort: 45 minutes_

  - [ ]* 10.4 Write integration tests for maze validation
    - Test each of 10 random MAZE_POOL mazes loads
    - Test each maze validates as solvable
    - Test maze data (grid, hearts, moving_walls) loads correctly
    - Test all maze structures are 20×20
    - Test no maze is selected twice in a row
    - _Requirements: 7.1-7.8, 8.1-8.2_
    - _Effort: 35 minutes_

- [ ] Phase 11: Final Integration and Polish

  - [~] 11.1 Verify all requirements are implemented
    - Create checklist of all 12 requirements
    - Verify each requirement has corresponding code
    - Test all 15 correctness properties with manual verification
    - Ensure no requirements are missed
    - Document any design decisions that deviate from spec

  - [~] 11.2 Performance optimization and profiling
    - Profile canvas rendering (target 60fps during gameplay)
    - Profile maze pool loading (target < 1 second)
    - Optimize collision detection (O(1) for lava, O(n) for walls)
    - Test game on lower-end devices/older browsers
    - Verify no memory leaks in long play sessions

  - [~] 11.3 Final checkpoint - Play and verify
    - Play complete game rounds 5+ times
    - Test collecting hearts strategically
    - Test all death scenarios (lava, moving wall, cumulative)
    - Test pause/resume at various points
    - Test maze variety (play 10+ different random mazes)
    - Verify all UI elements display correctly
    - Ask user if questions arise, verify complete

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be deferred for an MVP release
- Each task references specific requirements and properties for full traceability
- Moving wall bounce-back logic (Task 3.2) is complex; ensure thorough testing with edge cases
- Maze pool creation (Task 5.2) is time-intensive; consider tools or procedural generation to accelerate
- All 15 correctness properties should be verified even if automated property tests are deferred
- Event prevention (Phase 8) must be tested across browsers to ensure cross-platform consistency
- Optional sub-tasks should be implemented after core functionality is complete and stable

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "2.3", "4.1"] },
    { "id": 2, "tasks": ["1.3", "2.4", "2.5"] },
    { "id": 3, "tasks": ["3.1", "3.2", "4.2", "4.3", "5.1"] },
    { "id": 4, "tasks": ["3.3", "3.4", "4.4", "4.5", "5.2", "5.3"] },
    { "id": 5, "tasks": ["5.4", "6.1", "6.2", "7.1", "7.2", "8.1", "8.2"] },
    { "id": 6, "tasks": ["6.3", "6.4", "7.3", "7.4"] },
    { "id": 7, "tasks": ["8.3"] },
    { "id": 8, "tasks": ["1.4", "2.6", "2.7", "2.8", "2.9", "3.5", "3.6", "4.6", "4.7", "5.5", "5.6", "5.7", "6.5"] },
    { "id": 9, "tasks": ["10.1", "10.2", "10.3", "10.4"] },
    { "id": 10, "tasks": ["11.1", "11.2", "11.3"] }
  ]
}
```
