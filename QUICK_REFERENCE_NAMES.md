# 🎮 Quick Reference: Anonymous Multiplayer System

## 📝 Player Names

### Auto-Generated Format
```javascript
"DeepTyper1234"  // Random number 1-9999
"DeepTyper5678"
"DeepTyper9999"
```

### Custom Name Rules
- Length: 3-20 characters
- Allowed: Letters, numbers, spaces
- Examples: `SpeedDemon`, `Fast Fingers`, `TypeMaster99`

---

## 🔧 API Reference

### multiplayerService Methods

```javascript
// Get current player name
const name = multiplayerService.getPlayerName();
// Returns: "DeepTyper1234"

// Generate new random name
const randomName = multiplayerService.generatePlayerName();
// Returns: "DeepTyper7832"

// Update player name (saves to localStorage + database)
try {
  const newName = multiplayerService.updatePlayerName("SpeedDemon");
  console.log('Name updated:', newName);
} catch (error) {
  console.error('Invalid name:', error.message);
}

// Note: Name auto-saves to localStorage
// and syncs to database if in active game
```

---

## 🎨 UI Component

### PlayerNameEditor

```jsx
import PlayerNameEditor from './PlayerNameEditor';

// Basic usage
<PlayerNameEditor />

// With callback
<PlayerNameEditor 
  onNameChange={(newName) => {
    console.log('Name changed to:', newName);
    // Optional: update local state, show notification, etc.
  }} 
/>
```

**Displays:**
- View mode: `[DeepTyper1234] [✎ Edit Name]`
- Edit mode: `[Input______] [✓] [✕]`

**Features:**
- Inline editing
- Validation
- Error messages
- Keyboard shortcuts (Enter/Esc)
- Auto-save to localStorage
- Auto-sync to database

---

## 💾 localStorage

### Structure
```javascript
// Key
'deeptype_player_name'

// Value examples
'DeepTyper1234'
'SpeedDemon'
'Fast Fingers'
```

### Manual Access (if needed)
```javascript
// Read
const name = localStorage.getItem('deeptype_player_name');

// Write (use service instead!)
localStorage.setItem('deeptype_player_name', 'NewName');

// Clear
localStorage.removeItem('deeptype_player_name');
```

**Recommendation:** Use `multiplayerService` methods instead of direct localStorage access!

---

## 🔄 Typical User Flow

```
First Visit:
  User opens app
  → Auto-generates "DeepTyper1234"
  → Saves to localStorage
  → Shows in waiting screen
  → User can edit if wanted

Returning Visit:
  User opens app
  → Loads "DeepTyper1234" from localStorage
  → Same name appears
  → Continues seamlessly

Name Change:
  User clicks "Edit Name"
  → Types "SpeedDemon"
  → Clicks ✓ or presses Enter
  → Saved to localStorage
  → Updated in database (if in game)
  → Other players see change instantly
```

---

## 🎯 Integration Example

### Waiting Screen

```jsx
function WaitingScreen({ players }) {
  const myId = multiplayerService.currentPlayerId;

  return (
    <div>
      <h2>⏳ Waiting for players...</h2>
      
      {/* Name Editor */}
      <div style={{ margin: '20px 0' }}>
        <span>Your name: </span>
        <PlayerNameEditor />
      </div>

      {/* Player List */}
      <div>
        <p>Players in room: {players.length}/4</p>
        {players.map(player => (
          <div key={player.id}>
            {player.player_name}
            {player.id === myId && ' (You)'}
          </div>
        ))}
      </div>

      <p>Game starts when 2+ players join!</p>
    </div>
  );
}
```

---

## ✅ Validation Rules

### Built-in Validation

```javascript
// Too short (< 3 chars)
multiplayerService.updatePlayerName('Hi');
// ❌ Error: "Name must be between 3 and 20 characters"

// Too long (> 20 chars)
multiplayerService.updatePlayerName('ThisNameIsTooLongToBeValid');
// ❌ Error: "Name must be between 3 and 20 characters"

// Invalid characters
multiplayerService.updatePlayerName('@Cool#User$');
// ❌ Error: "Name can only contain letters, numbers, and spaces"

// Valid names
multiplayerService.updatePlayerName('SpeedDemon');      // ✅
multiplayerService.updatePlayerName('Fast Fingers');   // ✅
multiplayerService.updatePlayerName('TypeMaster99');   // ✅
```

---

## 🐛 Common Patterns

### Get Player Name in Component

```jsx
function MyComponent() {
  const [playerName, setPlayerName] = useState(
    multiplayerService.getPlayerName()
  );

  return (
    <div>
      Welcome, {playerName}!
    </div>
  );
}
```

### Update Name Programmatically

```jsx
function handleRandomName() {
  const newName = multiplayerService.generatePlayerName();
  setPlayerName(newName);
  // Already saved to localStorage automatically!
}
```

### Reset Name to Default

```jsx
function handleReset() {
  const defaultName = multiplayerService.generatePlayerName();
  setPlayerName(defaultName);
}
```

---

## 🎨 Styling the Name Editor

The component includes default styles, but you can customize:

```jsx
// Option 1: CSS classes
<div className="my-name-editor">
  <PlayerNameEditor />
</div>

// Option 2: Wrapper styling
<div style={{ 
  padding: '20px',
  background: '#2a2a2a',
  borderRadius: '8px'
}}>
  <PlayerNameEditor />
</div>

// Option 3: Fork the component and modify styles object
```

---

## 🔒 Privacy Notes

### What's Stored
- ✅ Player name (localStorage only)
- ✅ Current game session data (temporary)

### What's NOT Stored
- ❌ Email addresses
- ❌ Passwords
- ❌ Personal information
- ❌ Tracking cookies
- ❌ User history (beyond current session)

### GDPR Compliance
- No PII collected
- No persistent tracking
- localStorage is user-controlled
- Can clear anytime

---

## 🧪 Testing Commands

```javascript
// In browser console (F12):

// Get current name
multiplayerService.getPlayerName()

// Generate new random name
multiplayerService.generatePlayerName()

// Change name
multiplayerService.updatePlayerName('TestUser')

// Check localStorage
localStorage.getItem('deeptype_player_name')

// Clear name (force regeneration)
localStorage.removeItem('deeptype_player_name')
window.location.reload()
```

---

## 📊 Database Schema

```sql
-- Players table (simplified)
CREATE TABLE players (
  id UUID PRIMARY KEY,
  room_id UUID,
  player_name TEXT NOT NULL,  -- "DeepTyper1234" or custom
  progress INTEGER,
  wpm INTEGER,
  -- ... other fields
);

-- No users table needed!
-- No authentication required!
```

---

## 🎉 Key Advantages

✅ **Zero Friction**
- No signup forms
- No email verification
- No password requirements
- Just open and play!

✅ **Privacy First**
- No personal data collected
- No accounts to hack
- No email spam
- Full anonymity

✅ **Developer Friendly**
- No auth system to build
- No security vulnerabilities
- No password resets
- No account recovery

✅ **User Friendly**
- Instant access
- Memorable format
- Easy to customize
- Persists automatically

---

## 🚀 That's It!

You now have everything you need to implement anonymous multiplayer.

**Three lines to add it to your app:**

```jsx
import multiplayerService from './services/multiplayerService';
import PlayerNameEditor from './components/MultiplayerMode/PlayerNameEditor';

<PlayerNameEditor />  // That's it!
```

Simple, effective, just like keybr.com! 🎮

---

**See Also:**
- `ANONYMOUS_USERS.md` - Full documentation
- `CHANGELOG_ANONYMOUS.md` - What changed
- `MultiplayerRace.example.js` - Full integration example
