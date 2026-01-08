# Queen Machines - Fighting Game

A browser-based fighting game template inspired by the original Mortal Kombat, built with HTML5 Canvas, CSS3, and vanilla JavaScript.

## Features

- **Two-player local gameplay** with independent controls
- **Complete fighting mechanics**: Punch, Kick, Block, Jump, Crouch, Walk
- **Animation system** with 9 different animation states per fighter
- **Health bars** with visual feedback
- **Round-based matches** (Best of 3 rounds)
- **99-second round timer**
- **Collision detection** and hit detection system
- **Physics system** with gravity and jumping
- **Knockback effects** when hit
- **Damage reduction** when blocking

## How to Play

### Running the Game

1. Open `index.html` in a web browser, or
2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
   Then navigate to `http://localhost:8000`

### Controls

**Player 1 (Red Fighter - Left Side):**
- **W** - Jump
- **S** - Crouch
- **A** - Move Left
- **D** - Move Right
- **J** - Punch (5 damage)
- **K** - Kick (8 damage)
- **L** - Block (reduces damage by 66%)

**Player 2 (Blue Fighter - Right Side):**
- **↑** - Jump
- **↓** - Crouch
- **←** - Move Left
- **→** - Move Right
- **1** - Punch (5 damage)
- **2** - Kick (8 damage)
- **3** - Block (reduces damage by 66%)

### Game Rules

- Each match is best of 3 rounds
- Each round has a 99-second timer
- Fighters start with 100 health points
- First fighter to reach 0 health loses the round
- If time runs out, fighter with more health wins
- Win 2 rounds to win the match

## Animation System & Sprite Integration

The game uses a placeholder sprite system with colored squares displaying animation state information. Each fighter has 9 animation states:

1. **idle** - 4 frames
2. **walk_forward** - 6 frames
3. **walk_backward** - 6 frames
4. **jump** - 3 frames
5. **crouch** - 1 frame
6. **punch** - 3 frames
7. **kick** - 4 frames
8. **block** - 1 frame
9. **hit** - 2 frames

### Adding Your Own Sprites

To replace the placeholder squares with actual sprites:

1. **Sprite Naming Convention**: 
   - Format: `p{player}_{animation}_{frame}.png`
   - Examples: 
     - `p1_idle_0.png` - Player 1, idle animation, frame 0
     - `p1_punch_1.png` - Player 1, punch animation, frame 1
     - `p2_kick_3.png` - Player 2, kick animation, frame 3

2. **Sprite Dimensions**:
   - Width: 60 pixels
   - Height: 100 pixels
   - (Adjust `this.width` and `this.height` in Fighter class constructor if needed)

3. **Implementation**:
   - Modify the `Fighter.draw()` method in `game.js`
   - Replace the `ctx.fillRect()` placeholder drawing code with sprite loading
   - Use `ctx.drawImage()` to render the sprite images
   - Example:
   ```javascript
   const spriteFilename = `p${this.playerNumber}_${this.currentAnimation}_${this.animationFrame}.png`;
   const sprite = new Image();
   sprite.src = `./sprites/${spriteFilename}`;
   ctx.drawImage(sprite, 0, 0, this.width, this.height);
   ```

4. **Sprite Sheet Organization** (recommended structure):
   ```
   sprites/
   ├── p1_idle_0.png
   ├── p1_idle_1.png
   ├── p1_idle_2.png
   ├── p1_idle_3.png
   ├── p1_walk_forward_0.png
   ├── ...
   ├── p2_idle_0.png
   └── ...
   ```

## Code Structure

- **index.html** - Main HTML structure with game UI
- **style.css** - Styling for health bars, UI elements, and layout
- **game.js** - Game engine with:
  - Fighter class with animation and combat systems
  - Game loop and rendering
  - Input handling
  - Collision detection
  - Round/match management

## Technical Details

- **Canvas Size**: 800x450 pixels
- **Frame Rate**: ~60 FPS (using requestAnimationFrame)
- **Ground Level**: Y = 350
- **Gravity**: 0.8 pixels/frame²
- **Jump Force**: -15 pixels/frame
- **Move Speed**: 5 pixels/frame
- **Attack Ranges**: Punch (80px), Kick (90px)

## Future Enhancements

- Add sprite preloading system
- Implement special moves and combos
- Add sound effects and music
- Include more fighters with unique movesets
- Add stage backgrounds
- Implement AI opponent
- Add combo counter
- Include finishing moves

## License

Open source - feel free to use and modify for your fighting game project!
