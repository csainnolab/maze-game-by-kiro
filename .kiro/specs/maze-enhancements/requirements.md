# Requirements Document: Maze Game Enhancements

## Introduction

This document specifies major enhancements to the existing maze-running game. The enhancements expand the game from a basic 10×10 maze into a more engaging experience with a 20×20 grid, health-based gameplay mechanics, collectible items, and randomized maze generation. These changes transform the game from instant-death mechanics to a health-based progression system with multiple preset maze configurations.

## Glossary

- **Player**: The avatar controlled by the user, navigating the maze
- **Grid**: The rectangular game board divided into tiles; upgraded from 10×10 to 20×20
- **Tile**: An individual cell in the grid, which can be empty, a wall, lava, moving wall, start, end, or heart collectible
- **Start**: Green tile where the player begins each maze
- **End**: Gold tile that marks the goal; reaching it completes the maze
- **Wall**: Static obstacle that blocks player movement
- **Lava**: Hazardous tile that damages the player by 1 health on contact
- **Moving_Wall**: Dynamic obstacle that bounces the player backward and damages by 1 health on contact
- **Heart_Collectible**: Pickup tile that recovers 1 health (max 5) when collected
- **Health**: Player resource tracked as 1-5 hearts; losing all hearts triggers game over
- **Heart**: One unit of health; player starts with 5 hearts
- **Maze_Configuration**: A preset 20×20 layout with specific obstacle placements
- **Maze_Pool**: A collection of 100+ validated, randomized maze configurations
- **Solvable**: A maze through which at least one valid path exists from start to end (validated via BFS)
- **Multiple_Paths**: A maze offering at least 3 distinct routes from start to end
- **Bounce_Back**: Mechanic where moving wall contact displaces the player away from the wall

## Requirements

### Requirement 1: Grid Expansion

**User Story:** As a player, I want larger mazes so that I can enjoy more complex navigation challenges.

#### Acceptance Criteria

1. THE Game SHALL support a 20×20 grid (400 tiles per maze)
2. WHEN the game initializes THEN the Grid_Size configuration SHALL be updated to 20
3. WHEN a maze is rendered THEN all 400 tiles (20 rows × 20 columns) SHALL be visually displayed
4. WHEN a player moves THEN movement boundaries SHALL respect the 20×20 grid limits (0-19 for row and column)

---

### Requirement 2: Keyboard Input Event Prevention

**User Story:** As a player, I want WASD and arrow key presses to control the game without scrolling the page, so that I can play smoothly without distracting viewport changes.

#### Acceptance Criteria

1. WHEN a user presses W, A, S, D, or arrow keys THEN THE Game SHALL prevent the default browser scroll behavior
2. WHEN the handleKeyDown event fires for directional keys THEN event.preventDefault() SHALL be called
3. WHEN a user presses other keys (not movement keys) THEN normal browser behavior SHALL be preserved
4. WHEN the pause or restart keys (ESC, R) are pressed THEN THE Game SHALL prevent default browser behavior for those keys as well

---

### Requirement 3: Health System Implementation

**User Story:** As a player, I want a health-based damage system so that I can survive multiple hazards instead of instant death.

#### Acceptance Criteria

1. WHEN the game starts THEN THE Player SHALL initialize with 5 hearts (maximum health)
2. WHEN the player contacts Lava THEN THE Player SHALL lose 1 heart and continue playing
3. WHEN the player contacts a Moving_Wall THEN THE Player SHALL lose 1 heart and continue playing
4. WHEN the player's health reaches 0 hearts THEN THE Game_State SHALL change to DEAD and display a game-over message
5. WHEN the player's health decreases THEN THE Heart_Display SHALL update to show remaining health
6. WHEN the player's health increases (via collectibles) THEN THE Heart_Display SHALL update immediately
7. IF a player has 5 hearts THEN THE Player SHALL not be able to gain additional health (max capped at 5)

---

### Requirement 4: Lava Collision Mechanics (Non-Lethal)

**User Story:** As a player, I want lava to damage me but not instantly kill me, so that I can continue playing after a mistake.

#### Acceptance Criteria

1. WHEN the player moves onto a Lava tile THEN THE Player SHALL lose 1 heart
2. WHEN the player loses health to Lava THEN THE Player SHALL remain at the Lava tile position
3. WHEN the player's health is greater than 0 after Lava contact THEN THE Game_State SHALL remain PLAYING
4. WHEN the player has 1 heart and contacts Lava THEN THE Player SHALL have 0 hearts and THE Game_State SHALL change to DEAD

---

### Requirement 5: Moving Wall Collision Mechanics (Bounce Back)

**User Story:** As a player, I want moving walls to bump me backward instead of killing me instantly, so that I can learn the wall patterns and navigate around them.

#### Acceptance Criteria

1. WHEN the player contacts a Moving_Wall THEN THE Player SHALL lose 1 health
2. WHEN the player contacts a Moving_Wall THEN THE Player SHALL be bumped backward (away from the wall)
3. WHEN a player is bumped backward from a Moving_Wall THEN THE Player's new position SHALL be adjacent to the Moving_Wall in the opposite direction of the wall's movement
4. WHEN the player is bumped backward THEN movement boundaries SHALL be respected (player cannot be bumped off the grid)
5. WHEN the player is bumped backward and their health reaches 0 THEN THE Game_State SHALL change to DEAD
6. WHEN the player is bumped backward THEN THE Game SHALL provide visual feedback (brief animation/flicker) to indicate collision

---

### Requirement 6: Heart Collectible Tile Type

**User Story:** As a game designer, I want to add heart collectibles to mazes so that players have opportunities to recover health.

#### Acceptance Criteria

1. THE Tile system SHALL include a new HEART tile type (distinct from other tiles)
2. WHEN a maze is generated THEN exactly 2 Heart_Collectibles SHALL be placed per maze
3. WHEN a player moves onto a Heart_Collectible tile THEN THE Heart SHALL be collected and removed from the maze
4. WHEN a Heart_Collectible is collected THEN THE Player SHALL recover 1 health (if health < 5)
5. WHEN a player with 5 hearts contacts a Heart_Collectible THEN THE Heart SHALL still be collected but health remains at 5
6. WHEN a Heart_Collectible is collected THEN THE Game SHALL display a "+1 Health" feedback message
7. WHEN a Heart_Collectible is collected THEN THE Heart_Display SHALL update to reflect the new health value

---

### Requirement 7: Randomized Maze Generation with Validation

**User Story:** As a game designer, I want randomized maze generation so that players face different challenges each game, with validation to ensure playability.

#### Acceptance Criteria

1. THE Game SHALL maintain a Maze_Pool of 100+ preset 20×20 maze configurations
2. WHEN the game starts THEN THE Game SHALL randomly select one Maze_Configuration from the Maze_Pool
3. WHEN the game restarts (after winning or dying) THEN THE Game SHALL randomly select a Maze_Configuration from the Maze_Pool
4. THE Game SHALL ensure each selected maze is not the same as the previously played maze (no immediate repeats)
5. EACH Maze_Configuration SHALL be validated to ensure it is Solvable (contains at least one valid path from Start to End)
6. EACH Maze_Configuration SHALL be validated via BFS (breadth-first search) to confirm path existence
7. WHEN a maze is loaded THEN THE Validation system SHALL confirm the maze meets solvability requirements before play begins
8. THE Game SHALL display which maze number is currently loaded (e.g., "Maze 1 of 100")

---

### Requirement 8: Preset Maze Configurations

**User Story:** As a game designer, I want diverse, well-designed mazes that offer multiple paths and varied difficulty.

#### Acceptance Criteria

1. EACH Maze_Configuration SHALL be a 20×20 grid with 400 tiles
2. EACH Maze_Configuration SHALL include:
   - 1 START tile (green)
   - 1 END tile (gold)
   - Multiple walls to create challenge
   - 2-3 Moving_Wall obstacles
   - Lava sections to create hazards
   - 2 Heart_Collectible tiles positioned strategically
3. EACH Maze_Configuration SHALL offer at least 3 distinct routes from START to END (Multiple_Paths requirement)
4. EACH Maze_Configuration SHALL vary in difficulty:
   - Some mazes with straightforward paths and fewer hazards
   - Some mazes with complex pathfinding and dense obstacle clusters
   - Some mazes with strategic heart placement to aid progression
5. EACH Maze_Configuration SHALL be hand-designed or algorithmically generated to ensure quality and playability

---

### Requirement 9: Heart Display UI

**User Story:** As a player, I want to see my current health clearly in the UI so that I know how many more hits I can take.

#### Acceptance Criteria

1. WHEN the game displays the HUD THEN THE Heart_Display SHALL show exactly 5 heart icons
2. WHEN the player has N hearts THEN THE Heart_Display SHALL show N filled hearts and (5-N) empty hearts
3. WHEN the player's health changes THEN THE Heart_Display SHALL update immediately
4. THE Heart_Display SHALL use a distinct visual style (red/pink color, SVG or text-based hearts)
5. WHEN a player collects a Heart_Collectible THEN THE display SHALL briefly highlight or animate to provide feedback

---

### Requirement 10: Maze Selection Display

**User Story:** As a player, I want to know which maze I'm currently playing so that I can track progress across multiple rounds.

#### Acceptance Criteria

1. WHEN a maze is loaded THEN THE UI SHALL display a maze identifier (e.g., "Maze 1 of 100")
2. WHEN the player starts the game THEN THE Maze_Identifier SHALL be visible in the HUD
3. WHEN a new maze is randomly selected THEN THE Maze_Identifier SHALL update to reflect the new selection
4. THE Maze_Identifier display SHALL persist throughout gameplay until the level ends

---

### Requirement 11: Game Over Message

**User Story:** As a player, I want context-specific game-over messages so that I understand why I died.

#### Acceptance Criteria

1. WHEN the player's health reaches 0 THEN THE Game_State SHALL transition to DEAD
2. WHEN the Game_State is DEAD THEN THE UI SHALL display a death message indicating the cause:
   - "Burned by lava!" (if death caused by lava)
   - "Crushed by a moving wall!" (if death caused by moving wall)
   - "Out of health!" (if death caused by cumulative damage)
3. THE death message SHALL be prominently displayed in the game-over overlay
4. WHEN the player clicks "Try Again" THEN THE Game SHALL reset and load a new random maze

---

### Requirement 12: Collision Feedback Animation

**User Story:** As a player, I want visual feedback when I collide with hazards so that I understand what hurt me.

#### Acceptance Criteria

1. WHEN the player collides with a Moving_Wall THEN THE Game SHALL display a brief animation (e.g., flicker, shake, color change) at the collision point
2. WHEN the player is bumped backward by a Moving_Wall THEN THE Player's sprite SHALL briefly flash or change color
3. WHEN the player contacts Lava THEN THE Game MAY display a heat effect or color wash for visual feedback
4. THE collision animations SHALL last no more than 200ms to avoid disrupting gameplay
5. THE collision feedback SHALL provide sufficient visual information without being distracting

---

## Summary

This enhancement package transforms the maze game from a basic 10×10 instant-death experience into a feature-rich 20×20 game with health-based progression, collectibles, and 100+ randomized maze configurations. All hazards become damage sources rather than instant kills, encouraging exploration and skill development. The expanded grid and multiple maze options provide long-term replayability.

