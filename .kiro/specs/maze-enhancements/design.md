# Design Document: Maze Game Enhancements

## Overview

The maze game enhancements transform a basic 10×10 instant-death game into a feature-rich 20×20 experience with health-based progression, collectible items, and 100+ randomized maze configurations. Rather than instant death on hazard contact, the player now manages a 5-heart health pool and can recover health by collecting heart items strategically placed throughout each maze.

**Key Transformations:**
- Grid expansion from 10×10 to 20×20 (400 tiles per maze)
- Health system: 5 hearts as starting maximum
- Lava: Deals 1 damage instead of instant death
- Moving walls: Bounce player backward + 1 damage instead of instant death
- New collectible: Heart tiles restore 1 health (capped at 5)
- Preset maze pool: 100+ hand-crafted mazes with validation
- Randomized maze selection: Ensures no immediate repeats

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────┐
│        Game State Management            │
│  (health, position, game state, timer)  │
└─────────────────────────────────────────┘
           ↓           ↓          ↓
    ┌─────────┐  ┌──────────┐  ┌─────────┐
    │ Maze    │  │ Collision│  │ Moving  │
    │ Selection │  │ Detection│  │ Walls   │
    │         │  │          │  │ Engine  │
    └─────────┘  └──────────┘  └─────────┘
           ↓           ↓          ↓
    ┌─────────────────────────────────────┐
    │      Rendering System               │
    │  (Canvas, HUD, feedback animations) │
    └─────────────────────────────────────┘
```

### Data Flow

1. **Initialization**: Load preset maze pool, select random maze, initialize player at START, set health to 5
2. **Game Loop**: 
   - Accept input (keyboard/buttons)
   - Update player position
   - Update moving walls (every 750ms)
   - Check collisions (lava, moving walls, hearts, end)
   - Update health/state
   - Render UI + feedback
3. **Collision Resolution**: Determine damage, position adjustment, state changes
4. **Game End**: Win or death → present overlay → restart loads new maze

### Module Organization

| Module | Responsibility |
|--------|-----------------|
| **Game State** | Track player health, position, current maze index, game state |
| **Maze Data** | Store 100+ preset maze configurations with metadata |
| **Maze Selection** | Random selection with repeat prevention, validation |
| **Collision System** | Lava damage, moving wall bounce-back, heart collection |
| **Rendering** | Canvas drawing, HUD updates, collision feedback |
| **Input Handler** | Keyboard/button input with event prevention |
| **Timer/Animation** | Game timer, moving wall animation, collision feedback |

## Components and Interfaces

### Tile System Expansion

```javascript
const TILE = {
    EMPTY: 0,
    WALL: 1,
    LAVA: 2,
    START: 3,
    END: 4,
    MOVING_WALL: 5,
    HEART: 6  // New tile type
};
```

### Game State Object

```javascript
const game = {
    state: 'READY' | 'PLAYING' | 'PAUSED' | 'DEAD' | 'WON',
    level: number[][],           // Current 20×20 maze
    player: { row, col, health }, // Current position and health
    currentMazeIndex: number,     // 0-99 index in maze pool
    previousMazeIndex: number,    // Last maze played (for repeat prevention)
    hearts: [{ row, col }, ...],  // Heart collectibles (0-2 per maze)
    movingWalls: [
        { row, col, direction, maxSteps, step, direction_step },
        ...
    ],
    attempts: number,
    timer: { elapsed, started, intervalId },
    input: { pressed: {} }
};
```

### Preset Maze Configuration

```javascript
const MAZE_POOL = [
    {
        id: 0,
        grid: [
            // 20×20 2D array with tile types
            [3, 1, 1, 1, ... ],
            ...
        ],
        moving_walls: [
            { row: 5, col: 8, direction: 0, maxSteps: 3 },
            { row: 12, col: 10, direction: 1, maxSteps: 2 }
        ],
        hearts: [
            { row: 8, col: 7 },
            { row: 15, col: 18 }
        ],
        difficulty: 'medium',  // Metadata for future filtering
        hazard_count: 25
    },
    // ... 100+ more mazes
];
```

### Collision Detection Interface

```javascript
function checkCollisions() {
    // Returns object with collision info
    const { row, col } = game.player;
    
    const collision = {
        type: 'lava' | 'moving_wall' | 'heart' | 'end' | null,
        damageDealt: 0 | 1,
        bumpDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null,
        healthAfter: number,
        stateAfter: 'PLAYING' | 'DEAD' | 'WON'
    };
}
```

### Heart Collection Interface

```javascript
function collectHeart(row, col) {
    // Removes heart from game.hearts array
    // Increases player.health by 1 (capped at 5)
    // Displays "+1 Health" feedback
    
    game.hearts = game.hearts.filter(h => !(h.row === row && h.col === col));
    game.player.health = Math.min(game.player.health + 1, 5);
    
    return {
        healthAfter: game.player.health,
        feedbackPosition: { row, col }
    };
}
```

## Data Models

### Maze Grid Format (20×20)

Each maze is a 2D array where each cell contains a tile type constant. Grid dimensions are fixed at 20×20 (400 cells total).

```
[
  [START, WALL, WALL, WALL, EMPTY, LAVA, ...],  // row 0
  [EMPTY, EMPTY, WALL, EMPTY, HEART, LAVA, ...], // row 1
  ...,
  [WALL, EMPTY, MOVING_WALL, END, ...]           // row 19
]
```

### Moving Wall State

Each moving wall tracks:
- **row/col**: Current position
- **direction**: 0 (horizontal), 1 (vertical)
- **maxSteps**: Maximum displacement from origin
- **step**: Current step count (0 to maxSteps)
- **direction_step**: +1 or -1 to reverse at boundaries

### Health Tracking

- **Range**: 0-5 hearts
- **Starting value**: 5
- **Damage**: -1 per lava or moving wall contact
- **Recovery**: +1 per heart collectible (capped at 5)
- **Death condition**: health === 0

### Player Position

- **Bounds**: row ∈ [0, 19], col ∈ [0, 19]
- **Movement**: One tile per move (rate-limited to 120ms between moves)
- **Collision**: Can move into EMPTY, START, END, HEART; blocked by WALL, LAVA, MOVING_WALL

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Grid Boundaries

*For any* player position and any movement direction, the resulting position SHALL remain within grid bounds [0,19] × [0,19].

**Validates: Requirements 1.4**

**Rationale:** Movement logic must clamp positions to the 20×20 grid to prevent out-of-bounds access.

---

### Property 2: Health Damage on Lava Contact

*For any* player health value (1-5) and any lava tile contacted, the resulting health SHALL decrease by exactly 1 and game state SHALL remain PLAYING.

**Validates: Requirements 3.2, 4.1, 4.3**

**Rationale:** Lava deals consistent 1-point damage without instant death unless health reaches 0.

---

### Property 3: Health Damage on Moving Wall Contact

*For any* player health value (1-5) and any moving wall contacted, the resulting health SHALL decrease by exactly 1 and game state SHALL remain PLAYING.

**Validates: Requirements 3.3, 5.1**

**Rationale:** Moving walls deal consistent 1-point damage without instant death unless health reaches 0.

---

### Property 4: Health Never Exceeds Maximum

*For any* player health value and any heart collection attempt, the resulting health SHALL remain within bounds [0,5], with new health = min(current_health + 1, 5).

**Validates: Requirements 3.7, 6.4**

**Rationale:** Health is capped at 5; collecting hearts at max health removes the heart but doesn't increase health beyond the cap.

---

### Property 5: Lava Position Preservation

*For any* lava tile contacted, the player position after collision SHALL equal the lava tile position (player remains on the lava tile).

**Validates: Requirements 4.2**

**Rationale:** Lava deals damage but doesn't displace the player; they stay in place.

---

### Property 6: Moving Wall Bump-Back Direction

*For any* moving wall with a given movement direction (horizontal or vertical), the player's bumped position SHALL be adjacent to the moving wall in the opposite direction of the wall's movement and remain within grid bounds [0,19] × [0,19].

**Validates: Requirements 5.2, 5.3, 5.4**

**Rationale:** Moving walls displace players away from themselves, respecting grid boundaries.

---

### Property 7: Heart Collection Removes Collectible

*For any* heart tile at position (row, col), moving onto it SHALL remove the heart from the game state (hearts array no longer contains it).

**Validates: Requirements 6.3**

**Rationale:** Each heart can only be collected once and must be removed from the maze.

---

### Property 8: Death on Zero Health

*For any* sequence of damage events that reduces player health to 0, the game state SHALL transition to DEAD.

**Validates: Requirements 3.4, 4.4, 5.5, 11.1**

**Rationale:** Health reaching 0 is the game-over condition; the transition is immediate and consistent.

---

### Property 9: Maze Grid Dimensions

*For each* preset maze in the maze pool, the grid dimensions SHALL be exactly 20×20 (400 tiles).

**Validates: Requirements 1.1, 8.1**

**Rationale:** All preset mazes must conform to the standard 20×20 grid to ensure consistent game experience.

---

### Property 10: Maze Tile Count

*For each* preset maze, the count of heart collectible tiles SHALL be exactly 2.

**Validates: Requirements 6.2, 8.2**

**Rationale:** Every maze contains exactly 2 strategically placed hearts for gameplay balance.

---

### Property 11: Required Tile Types Per Maze

*For each* preset maze, there SHALL be exactly 1 START tile, exactly 1 END tile, and 2-3 MOVING_WALL tiles.

**Validates: Requirements 8.2**

**Rationale:** These tile counts ensure a valid and playable maze structure.

---

### Property 12: Maze Solvability

*For each* preset maze, a valid path SHALL exist from the START tile to the END tile via BFS, considering only walkable tiles (EMPTY, START, END, HEART) and avoiding walls and lava.

**Validates: Requirements 7.5, 7.6**

**Rationale:** Every preset maze must be completable; BFS validation ensures no mazes are designed with impossible layouts.

---

### Property 13: No Immediate Maze Repeats

*For any* two consecutive maze selections, the currently selected maze index SHALL NOT equal the previously selected maze index.

**Validates: Requirements 7.4**

**Rationale:** Players should not face the same maze twice in immediate succession, improving variety and replayability.

---

### Property 14: Movement Boundaries Enforce Grid Limits

*For any* boundary position (edge of grid) and movement attempt beyond that edge, the player position SHALL remain unchanged (movement is rejected).

**Validates: Requirements 1.4**

**Rationale:** Movement at grid edges must not allow out-of-bounds positions.

---

### Property 15: Heart Display Reflects Health

*For any* player health value N (0-5), the heart display UI SHALL show exactly N filled hearts and exactly (5-N) empty hearts.

**Validates: Requirements 9.2**

**Rationale:** The UI must accurately reflect the current health state at all times.

---

## Error Handling

### Health System Errors

- **Invalid health values**: Clamp to [0, 5] immediately
- **Null player object**: Log error and restart game
- **Damage over-cap**: Cap at 0; prevent negative health

### Collision System Errors

- **Invalid maze structure**: Log errors during validation, prevent level load
- **Moving wall out of bounds**: Clamp movement to grid boundaries
- **Duplicate tile removal**: Use Set to prevent double-removing collectibles

### Maze Selection Errors

- **Empty maze pool**: Provide default fallback maze or prevent game start with clear error message
- **Maze validation fails**: Log specific failures, prevent problematic maze from loading
- **Invalid maze index**: Use modulo operator to wrap to valid range

### Input Handling Errors

- **Rapid key presses**: Enforce moveDelay (120ms) between moves; ignore excess input
- **Movement during non-PLAYING state**: Reject movements in READY, PAUSED, DEAD, WON states
- **Invalid direction**: Silently ignore unknown directions

## Testing Strategy

### Property-Based Tests

Property-based tests will verify universal rules across many randomly generated inputs. Each property test should run with a minimum of 100 iterations to discover edge cases.

**Test Configuration:**
- **Library**: Use fast-check (JavaScript) or equivalent for the target language
- **Iterations**: Minimum 100 per property
- **Generators**: Random player positions, health values, maze configurations, movement directions, damage sequences

**Property Test Examples:**

1. **Grid Boundaries Property Test**
   - Generate: Random starting position, random direction
   - For 100+ iterations: Verify resulting position is within bounds
   - Tag: Feature: maze-enhancements, Property 1: Grid Boundaries

2. **Health Cap Property Test**
   - Generate: Random health values (0-5), random collection attempts
   - For 100+ iterations: Verify health never exceeds 5 after collection
   - Tag: Feature: maze-enhancements, Property 4: Health Never Exceeds Maximum

3. **Maze Solvability Property Test**
   - Generate: Each of 100+ preset mazes
   - For 100+ iterations: Run BFS validation, verify path exists
   - Tag: Feature: maze-enhancements, Property 12: Maze Solvability

4. **No Repeat Mazes Property Test**
   - Generate: Sequence of 100+ maze selections
   - For 100+ iterations: Verify current ≠ previous maze index
   - Tag: Feature: maze-enhancements, Property 13: No Immediate Maze Repeats

### Unit Tests (Example-Based)

Unit tests cover specific scenarios, edge cases, and integration points:

- **Grid expansion**: Verify CONFIG.GRID_SIZE is 20, canvas resizes correctly
- **Health initialization**: Player starts with health = 5
- **Lava on boundary**: Lava at grid edges doesn't cause position errors
- **Moving wall at corner**: Corner moving walls bump players into valid bounds
- **Heart collection at max health**: Heart collected but health stays at 5
- **Death state transition**: Health = 0 → state = DEAD
- **Maze selection at pool edge**: Maze 99 followed by maze 0 doesn't repeat
- **Event prevention**: W, A, S, D, arrow keys, R, ESC trigger preventDefault()

### Integration Tests

Integration tests verify end-to-end workflows:

- **Full game round**: Load maze → move to hearts → collect both → move to end → win
- **Damage and death**: Move to lava 5 times → health depletes → death
- **Restart flow**: Win game → click "Try Again" → new random maze loads
- **Moving wall collision**: Approach moving wall → damage taken → bump-back → continue
- **Maze validation**: Load each of 10 random preset mazes → all are solvable

### Performance Considerations

- **Canvas rendering**: Target 60fps during gameplay
- **Moving wall updates**: 750ms interval between position updates
- **Maze pool load time**: All 100+ mazes should load at startup in <1 second
- **Collision detection**: O(1) for lava/hearts, O(n) for moving walls (n ≤ 3)

## Implementation Phases

### Phase 1: Foundation (Grid & Config)
- Update CONFIG.GRID_SIZE to 20
- Update canvas sizing logic
- Test grid boundary enforcement

### Phase 2: Health System
- Add player.health property
- Implement health loss on lava/moving wall contact
- Implement death condition (health = 0)
- Add heart display UI

### Phase 3: Heart Collectibles
- Add TILE.HEART constant
- Implement heart collection logic
- Add "+1 Health" feedback animation

### Phase 4: Collision Redesign
- Change lava from instant-kill to 1 damage
- Implement moving wall bounce-back logic
- Update collision feedback animations

### Phase 5: Preset Maze Pool
- Create 100+ hand-crafted 20×20 mazes
- Implement BFS validation for solvability
- Store maze data in separate module/file

### Phase 6: Maze Randomization
- Implement random maze selection
- Add repeat prevention logic
- Add "Maze X of 100" UI display

### Phase 7: UI & Polish
- Update HUD for health and maze identifier
- Implement collision feedback animations
- Add death message display

### Phase 8: Input & Prevention
- Add event.preventDefault() for W, A, S, D, arrows, R, ESC

### Phase 9: Testing & Validation
- Write and run property tests
- Write and run unit tests
- Run integration tests
- Performance profiling

## Key Design Decisions

1. **Health System**: 5-heart maximum allows players to make 5 mistakes before death, encouraging exploration over perfection.

2. **Moving Wall Bounce-Back**: Instead of instant death, moving walls displace players away from themselves, creating dynamic gameplay and learning opportunities.

3. **Preset Maze Pool**: Hand-crafted mazes (vs. procedural generation) ensure quality, variety, and guaranteed solvability while still providing 100+ options for replayability.

4. **No Repeat Prevention**: Only prevents immediate back-to-back repeats (current ≠ previous), allowing the same maze to appear again later for player familiarity testing.

5. **Heart Placement**: Exactly 2 hearts per maze positioned strategically near hazards, encouraging risk-taking for health recovery.

6. **Collision Animations**: 200ms feedback ensures the player understands what hurt them without disrupting gameplay flow.

---

**Next Steps:** This design is ready for acceptance. Proceed to task creation phase to break down each component into implementable tasks.
