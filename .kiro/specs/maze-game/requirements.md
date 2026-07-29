# Maze Game Requirements Document

## Introduction

A browser-based 10×10 maze-running game where players navigate through dynamically generated mazes, avoid moving walls and lava hazards, and complete levels against a timer. The game features responsive design, arcade-style aesthetics, keyboard and touch controls, and seamless deployment to GitHub Pages via GitHub Actions.

## Glossary

- **Tile**: Individual grid square in the 10×10 maze (100 total tiles per level)
- **Player**: Controllable character navigating the maze (visual: █)
- **Wall**: Static solid obstacle that blocks movement
- **Moving_Wall**: Animated obstacle that travels along a predefined path and kills the player on contact
- **Lava**: Hazard tile that kills the player on contact; visually pulsing animation
- **Exit**: Goal tile where the player must reach to complete the level
- **Collision**: Detection when player occupies same tile as a hazard or barrier
- **Game_State**: Current operational mode (READY, PLAYING, PAUSED, DEAD, WON)
- **Attempt**: Single gameplay session; counter incremented on player death
- **Timer**: Elapsed time counter starting at 0 when PLAYING begins
- **Tick**: Single frame of the game loop (target ~16ms at 60 FPS)
- **Maze_Layout**: 10×10 grid array defining all tile types for a level
- **Level**: Specific maze configuration with defined start, exit, hazards, and moving walls

## Requirements

### Requirement 1: Tile Types and Maze Structure

**User Story:** As a game designer, I want to define various tile types that compose the maze, so that I can create challenging and varied gameplay environments.

#### Acceptance Criteria

1. THE Maze SHALL consist of a 10×10 grid of tiles (100 tiles total)
2. THE Maze SHALL support these tile types: Empty (traversable), Wall (solid), Lava (hazard), Exit (goal)
3. WHEN rendering the Maze, THE Game SHALL assign each tile type a unique visual representation:
   - Empty: light gray background
   - Wall: dark gray/black solid block (█)
   - Lava: orange/red with pulsing animation
   - Exit: bright gold/yellow with distinct border
4. WHEN validating a Maze_Layout, THE Level_Validator SHALL confirm exactly one Exit tile exists
5. WHEN validating a Maze_Layout, THE Level_Validator SHALL confirm at least one Empty tile exists for the Player start position
6. WHEN loading a Maze, THE Game SHALL parse the Layout array and render all tiles according to their types

### Requirement 2: Player Movement and Controls

**User Story:** As a player, I want to move my character through the maze using keyboard controls and on-screen buttons, so that I can navigate flexibly.

#### Acceptance Criteria

1. WHEN the Game is in PLAYING state, THE Player SHALL move one tile in the direction pressed (Up, Down, Left, Right)
2. WHEN the Player presses Arrow Keys (↑↓←→) or WASD keys, THE Game SHALL move the Player in the corresponding direction (resolves to Up/Down/Left/Right)
3. WHERE on-screen directional buttons exist, THE Game SHALL respond to clicks/taps on those buttons by moving the Player in the corresponding direction
4. WHEN the Player attempts to move into a Wall tile, THE Collision_Handler SHALL prevent the move and keep Player at current position
5. WHEN the Player attempts to move outside the 10×10 grid, THE Collision_Handler SHALL prevent the move and keep Player at current position
6. WHEN the Player occupies the same tile as a Moving_Wall at any Tick, THE Collision_Handler SHALL kill the Player
7. WHEN the Player occupies the same tile as Lava at any Tick, THE Collision_Handler SHALL kill the Player

### Requirement 3: Collision Detection

**User Story:** As a game developer, I want robust collision detection, so that hazards work consistently and the game feels fair.

#### Acceptance Criteria

1. WHEN the Player occupies a tile with a Moving_Wall, THE Collision_Handler SHALL detect this collision immediately
2. WHEN the Player occupies a tile with Lava, THE Collision_Handler SHALL detect this collision immediately
3. WHEN a collision with a hazard is detected, THE Game_State_Manager SHALL immediately transition to DEAD state
4. WHEN the Player occupies a tile with a Wall, THE Collision_Handler SHALL prevent that move
5. IF the Player coordinate is outside the maze grid [0,9]×[0,9], THEN the Collision_Handler SHALL prevent the move

### Requirement 4: Game States and State Transitions

**User Story:** As a player, I want clear game states so I understand when I can play, pause, and restart.

#### Acceptance Criteria

1. THE Game SHALL have exactly these states: READY, PLAYING, PAUSED, DEAD, WON
2. WHEN the Game starts, THE Game_State_Manager SHALL initialize the Game in READY state
3. WHEN the Player clicks "Start Game" button in READY state, THE Game_State_Manager SHALL transition to PLAYING state and start the Timer
4. WHEN the Player presses Spacebar or clicks "Pause" button in PLAYING state, THE Game_State_Manager SHALL transition to PAUSED state and freeze the Timer
5. WHEN the Player presses Spacebar or clicks "Resume" button in PAUSED state, THE Game_State_Manager SHALL transition back to PLAYING state and resume the Timer
6. WHEN the Player occupies the Exit tile while in PLAYING state, THE Game_State_Manager SHALL transition to WON state and stop the Timer
7. WHEN a collision with a hazard occurs in PLAYING state, THE Game_State_Manager SHALL transition to DEAD state and stop the Timer
8. WHEN the Game is in DEAD state, THE Game SHALL display the current Attempt count and allow the Player to click "Retry" to return to READY state for the same Level
9. WHEN the Game is in WON state, THE Game SHALL display the final Timer value and Attempt count, and allow the Player to click "Next Level" to proceed to the next Level or "Menu" to return to READY

### Requirement 5: Timer and Attempts Tracking

**User Story:** As a player, I want to see elapsed time and track how many attempts I've used, so I can challenge myself.

#### Acceptance Criteria

1. THE Timer SHALL start at 0 when transitioning to PLAYING state
2. THE Timer SHALL increment by 1 each second while in PLAYING state
3. THE Timer SHALL freeze (not increment) when transitioning to PAUSED state
4. WHEN the Player moves to the Exit tile, THE Timer SHALL stop incrementing
5. THE Attempts_Counter SHALL initialize to 1 at the start of a Level
6. WHEN the Player dies, THE Attempts_Counter SHALL increment by 1 and the Game SHALL transition to DEAD state
7. WHEN the Player clicks "Retry", THE Game_State_Manager SHALL reset the Level to initial state but keep the Attempts_Counter incremented
8. WHEN the Game is in DEAD or WON state, THE UI SHALL display the current Timer value and Attempts_Counter value

### Requirement 6: Level Design and Validation

**User Story:** As a game designer, I want to create and validate maze levels programmatically, so I can ensure levels are playable and well-formed.

#### Acceptance Criteria

1. WHEN defining a Level, THE Designer SHALL provide a Maze_Layout (10×10 array of tile types), a Player_Start position, and a list of Moving_Wall paths
2. WHEN validating a Level, THE Level_Validator SHALL confirm:
   - The Maze_Layout is exactly 10×10
   - Exactly one Exit tile exists
   - At least one Empty tile exists
   - All Moving_Wall paths reference valid tiles
   - The Player_Start position is within bounds and is an Empty tile
3. IF any validation check fails, THE Level_Validator SHALL reject the Level and throw an error with a descriptive message
4. WHEN a valid Level is loaded, THE Game SHALL place the Player at Player_Start and render all tiles and Moving_Walls

### Requirement 7: Visual Design and Responsiveness

**User Story:** As a player, I want the game to look arcade-style and work smoothly on different screen sizes, so I can play on desktop, tablet, and mobile.

#### Acceptance Criteria

1. THE Game UI SHALL use an arcade/retro aesthetic with bold colors, high contrast, and pixel-art fonts
2. WHEN the viewport width is ≥1024px, THE Game_Board SHALL render at maximum size while maintaining 10×10 aspect ratio
3. WHEN the viewport width is 768px–1023px, THE Game_Board SHALL scale to 75% of desktop size
4. WHEN the viewport width is <768px, THE Game_Board SHALL scale to fit within the viewport with appropriate margins
5. WHEN resizing the browser window, THE Game_Board SHALL reflow and maintain proportions without requiring page reload
6. WHERE on-screen directional buttons exist, THEY SHALL scale proportionally with the Game_Board and remain accessible
7. WHEN touching or clicking UI elements on mobile, THE UI SHALL provide visual feedback (e.g., hover states, button press animation)
8. THE Game SHALL declare `viewport` meta tag with `width=device-width, initial-scale=1.0`
9. WHEN rendering tiles and the Player character, THE Game SHALL use high-contrast colors meeting WCAG AA standards (4.5:1 contrast ratio for text, 3:1 for UI components)

### Requirement 8: Moving Walls

**User Story:** As a game designer, I want moving walls that traverse predefined paths, so I can add dynamic challenge to levels.

#### Acceptance Criteria

1. WHEN a Level is initialized, THE Game SHALL read the list of Moving_Wall definitions (each with a path of tiles and a speed/interval)
2. THE Moving_Wall SHALL traverse its predefined path continuously in a loop (when path completes, start from first tile again)
3. WHEN a Moving_Wall reaches the end of its path, THE Moving_Wall SHALL return to the start tile and repeat
4. THE Moving_Wall SHALL animate smoothly or tick-based (target ~60 FPS or discretized per Tick)
5. WHEN the Player occupies the same tile as a Moving_Wall at any Tick, THE Collision_Handler SHALL detect this and kill the Player
6. WHEN a Moving_Wall is rendered, THE Game SHALL display it visually distinct from the Player (e.g., different color, shape, or animation)

### Requirement 9: Lava Hazards

**User Story:** As a game designer, I want lava tiles that kill the player on contact, so I can create dangerous zones.

#### Acceptance Criteria

1. WHEN a Level is loaded, Lava tiles SHALL be defined in the Maze_Layout (tile type = Lava)
2. WHEN the Player occupies the same tile as Lava, THE Collision_Handler SHALL immediately detect this and kill the Player
3. WHEN rendering Lava tiles, THE Game SHALL display them with a pulsing/animated orange-red visual effect to signal danger
4. WHEN the Player dies from Lava contact, THE UI SHALL display a message indicating the cause (e.g., "Fell into lava!")

### Requirement 10: Deployment and GitHub Integration

**User Story:** As a developer, I want the game to deploy automatically to GitHub Pages via GitHub Actions, so the game is always live.

#### Acceptance Criteria

1. WHEN code is pushed to the repository, THE GitHub Actions workflow SHALL trigger automatically
2. THE Workflow SHALL run build and validation checks (e.g., linting, asset validation)
3. WHEN all checks pass, THE Workflow SHALL deploy the built game to the `gh-pages` branch
4. THE GitHub Pages deployment SHALL serve the game at `https://<username>.github.io/maze-game-by-kiro/`
5. WHEN the `index.html` is served from GitHub Pages, THE Game SHALL load all assets (CSS, JS, images) correctly using relative paths
6. THE Game SHALL include a `.gitignore` file that excludes build artifacts, dependencies, and temporary files
7. THE Repository SHALL include a `README.md` with game description, controls, and link to the deployed game

### Requirement 11: Testing and Validation

**User Story:** As a developer, I want comprehensive tests to ensure game logic is correct, so releases are stable.

#### Acceptance Criteria

1. THE Game SHALL include unit tests for core functions (collision detection, state transitions, level validation)
2. WHEN collision detection is tested, THE Tests SHALL verify all hazard types (Moving_Walls, Lava) and boundary conditions
3. WHEN state transitions are tested, THE Tests SHALL verify all valid transitions and invalid transitions are rejected
4. WHEN level validation is tested, THE Tests SHALL verify both valid and invalid Level configurations are correctly classified
5. THE Test Suite SHALL run via `npm test` or equivalent and report results to the console
6. THE Tests SHALL use a standard testing framework (e.g., Jest, Vitest, Mocha) and generate coverage reports

## Notes

- All tile coordinates use 0-indexed (row, col) where [0,0] is top-left
- Timer increments in 1-second intervals (not per-tick)
- Moving walls should loop seamlessly when reaching the end of their path
- Level validation should be strict to prevent unplayable levels from being loaded
- Visual design should prioritize accessibility (high contrast, readable fonts)
- Responsive design should prioritize mobile-first approach where possible
