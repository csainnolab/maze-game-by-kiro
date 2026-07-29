# 🎮 MAZE RUNNER - Arcade Game

A retro arcade-style maze running game built with vanilla JavaScript, HTML, and CSS. Navigate through a challenging 10×10 maze while avoiding walls, lava, and mysterious moving obstacles.

**This project was 100% vibe coded using Kiro.**

---

## 🎯 Game Overview

Maze Runner is a thrilling single-player game where you guide your character through a procedurally-challenging maze. The gameplay is fast-paced, with a real-time timer, moving obstacles, and escalating difficulty. Every run is timed, and each attempt counts toward your score.

### Core Mechanics

- **Grid-Based Movement**: Navigate a 10×10 tile-based maze
- **Multiple Hazards**: Avoid walls, deadly lava pools, and mysteriously moving walls
- **Real-Time Timer**: Track your completion time in MM:SS.mmm format
- **Attempt Counter**: See how many tries it took you to complete the level
- **Moving Obstacles**: Dynamic walls that oscillate across the maze at fixed intervals
- **Responsive Controls**: Use keyboard, on-screen buttons, or touch controls

---

## 🕹️ How to Play

### Controls

| Action | Keyboard | Buttons |
|--------|----------|---------|
| Move Up | W / ↑ Arrow | ↑ Button |
| Move Down | S / ↓ Arrow | ↓ Button |
| Move Left | A / ← Arrow | ← Button |
| Move Right | D / → Arrow | → Button |
| Pause Game | ESC | PAUSE Button |
| Restart Level | R | RESTART Button |

### Objective

1. Start at the **green tile** (marked with 🟢)
2. Navigate through the maze
3. Avoid **purple walls** 🧱, **orange lava** 🔥, and **moving purple walls** 👻
4. Reach the **golden exit** 🎯 to win
5. Try to complete the level in as few attempts as possible

### Game States

- **READY**: Initial state, waiting for your first move
- **PLAYING**: Active gameplay with timer running
- **PAUSED**: Timer and animations frozen, overlay shown
- **DEAD**: You hit an obstacle, see your death message
- **WON**: You reached the exit, view your completion stats

---

## 🎨 Features

### Visual Design
- Arcade-inspired neon color scheme with cyan, magenta, and yellow accents
- Smooth animations and visual effects
- Pixel-art style rendering for retro feel
- Dynamic lava animation with flickering effect
- Pulsing moving wall effects

### Gameplay Features
- **Collision Detection**: Accurate detection for walls, lava, and moving obstacles
- **Level Validation**: Ensures the maze is solvable with proper START and END positions
- **Moving Walls**: Obstacles that oscillate at ~750ms intervals
- **Path Finding**: BFS validation to confirm a route exists to the exit
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices

### Accessibility
- Semantic HTML with proper ARIA labels
- Keyboard navigation support for all controls
- Visible focus states for interactive elements
- High contrast text and UI elements
- Touch-friendly button sizing on mobile

---

## 📦 Project Structure

```
maze-game-by-kiro/
├── index.html           # Main HTML file with game structure
├── style.css            # Complete styling with animations
├── game.js              # Core game logic and mechanics
├── README.md            # This documentation file
├── .gitignore           # Git exclusions
├── todo.txt             # Deployment checklist
└── .github/
    └── workflows/
        └── deploy.yml   # GitHub Actions deployment workflow
```

---

## 🚀 Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup Instructions

1. **Fork or Clone** this repository to your GitHub account
2. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Set source to "GitHub Actions"
3. **Push to main branch**: The workflow automatically deploys on push
4. **Access your game**: Visit `https://yourusername.github.io/maze-game-by-kiro/`

#### Subpath Hosting

If hosting in a repository subfolder (e.g., `https://yourusername.github.io/games/maze/`):
- The relative paths in HTML/CSS/JS are already configured to work with subpaths
- GitHub Actions handles path rewriting automatically

#### Manual Testing Locally

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Open browser to http://localhost:8000
```

---

## 🎮 Game Mechanics in Detail

### Tile Types

| Type | Symbol | Color | Behavior |
|------|--------|-------|----------|
| Empty | ◻ | Dark Blue | Walkable tile |
| Wall | ▮ | Purple | Blocks movement |
| Lava | ⚡ | Orange | Instant death |
| Start | 🟢 | Green | Player spawn |
| End | 🎯 | Gold | Win condition |
| Moving Wall | 👻 | Bright Purple | Mobile obstacle |

### Level Layout (10×10 Grid)

The maze is carefully designed with:
- One clear starting position (green)
- One exit position (gold)
- Multiple path options with varying difficulty
- At least one lava hazard section
- At least one moving wall obstacle
- Strategic wall placement to create challenge

### Movement Rules

- **Grid-based**: Move one tile per action
- **Boundary**: Cannot move outside the 10×10 grid
- **Collision**: Cannot move into walls, lava, or moving walls
- **Speed**: Movement has a ~120ms delay for controlled pacing

### Timer System

- **Start**: Timer begins on your first move
- **Format**: MM:SS.mmm (minutes:seconds.milliseconds)
- **Pause**: Stops running when game is paused
- **Stop**: Stops on death or victory
- **Display**: Updated every ~16ms (60fps)

### Attempts Counter

- **Initial**: Starts at 1 for the first attempt
- **Increment**: Increases by 1 each time you die
- **Reset**: Resets to 1 when you click "Play Again" after winning
- **Display**: Shows current attempt number

### Moving Walls

- **Behavior**: Oscillate between two adjacent positions
- **Interval**: Move every ~750ms
- **Pattern**: Smooth back-and-forth motion
- **Danger**: Instant death on collision
- **Animation**: Pulsing effect for visual feedback

---

## 🛠️ Technical Details

### Technologies Used

- **HTML5**: Semantic structure with Canvas element
- **CSS3**: Flexbox layout, gradients, animations, responsive design
- **JavaScript (Vanilla)**: No frameworks, pure game logic
- **Canvas API**: 2D rendering for game graphics
- **GitHub Actions**: CI/CD for automated deployment

### Code Organization

```javascript
// Game state management
TILE (constants for maze tiles)
GAME_STATE (constants for game states)
CONFIG (configuration values)
game (main game object)

// Initialization
init()
setupCanvas()
setupLevel()
setupMovingWalls()
setupEventListeners()

// Input handling
handleKeyDown()
handleKeyUp()
handleMovement()

// Game mechanics
canMove()
checkCollisions()
updateMovingWalls()

// Timer management
startTimer()
stopTimer()
updateTimerDisplay()

// State transitions
startGame()
togglePause()
restart()
playAgain()
kill()
win()

// Rendering
render()
drawTiles()
drawMovingWalls()
drawPlayer()
drawLava()

// Validation
validateLevel()
validateLevelStructure()
hasStartAndEnd()
movingWallsAdjacent()
hasPathToEnd()
```

### Performance Optimizations

- **Efficient Rendering**: Only redraws changed elements
- **Movement Delay**: Prevents rapid unintended moves
- **Canvas Optimization**: Uses pixelated rendering for retro effect
- **Mobile Friendly**: Optimized touch event handling
- **Responsive Layout**: CSS media queries for all screen sizes

---

## 🎯 Testing Checklist

Before deployment, verify:

- ✅ Player cannot move outside grid boundaries
- ✅ Player is blocked by walls (cannot pass through)
- ✅ Contact with lava causes instant death
- ✅ Contact with moving walls causes instant death
- ✅ Keyboard controls (W/A/S/D and arrows) work
- ✅ On-screen directional buttons work
- ✅ Pause button freezes timer and walls
- ✅ Restart button resets level and increments attempts
- ✅ Timer starts on first move and stops on death/win
- ✅ Attempts counter increments correctly
- ✅ Mobile layout is responsive and playable
- ✅ Level validation detects invalid configurations
- ✅ Pathfinding confirms route to exit exists
- ✅ GitHub Pages deployment works with subpaths
- ✅ All overlays display correctly (pause, death, win)
- ✅ Sound effects and animations are smooth

---

## 🐛 Known Issues & Limitations

- Moving walls move on fixed intervals, not perfectly synchronized
- Mobile touch controls recommended for optimal experience
- Game requires ES6+ browser support
- No sound effects in current version
- Single level only (extensible for multiple levels)

---

## 🎨 Customization

### Changing the Maze

Edit the `LEVEL` array in `game.js`:

```javascript
const LEVEL = [
    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // ... your 10x10 grid
];
```

Use these tile codes:
- `0` = Empty
- `1` = Wall
- `2` = Lava
- `3` = Start
- `4` = End
- `5` = Moving Wall

### Adding Moving Walls

Edit the `MOVING_WALLS_DEF` array:

```javascript
const MOVING_WALLS_DEF = [
    { row: 3, col: 7, direction: 1, maxSteps: 2 },
    { row: 5, col: 8, direction: 0, maxSteps: 2 }
];
```

- `direction`: 0 = horizontal, 1 = vertical
- `maxSteps`: Maximum distance to travel

### Adjusting Colors

Modify CSS variables in `style.css`:

```css
:root {
    --primary-color: #FF006E;      /* Magenta */
    --secondary-color: #00D9FF;    /* Cyan */
    --accent-color: #FFBE0B;       /* Yellow */
    /* ... more colors */
}
```

---

## 📄 License

This project is open source and available for personal and educational use.

---

## 🙏 Credits

Built with creativity, determination, and Kiro. This game demonstrates the power of vibe coding and rapid prototyping in game development.

**Enjoy the maze! 🎮**
