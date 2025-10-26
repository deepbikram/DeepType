# Anonymous Multiplayer System (Like keybr.com)

## 🎭 Overview

DeepType uses an **anonymous multiplayer system** - no login required! Every user gets a random name and can change it if they want.

## 🎯 How It Works

### 1. **First Visit**
When a user first opens multiplayer:
- Random name generated: `DeepTyper1234`
- Saved to localStorage (persists across sessions)
- User can immediately start playing

### 2. **Returning User**
When user comes back:
- Previous name loaded from localStorage
- No login needed
- Same name across all games

### 3. **Changing Name**
User can change their name anytime:
- Click "Edit Name" button
- Type new name (3-20 characters)
- Name updates instantly in current game
- Saved for future sessions

## 📝 Name Format

### Auto-generated Names
```
DeepTyper1234
DeepTyper5678
DeepTyper9999
```

- Format: `DeepTyper` + random number (1-9999)
- Memorable and fun
- Avoids collisions with 9999 possibilities

### Custom Names
Users can change to any name with these rules:
- ✅ 3-20 characters
- ✅ Letters, numbers, and spaces
- ✅ Examples:
  - `SpeedDemon`
  - `Fast Fingers`
  - `TypeMaster99`
  - `ninja typer`

## 🔧 Implementation

### Service Methods

```javascript
// Get current player name
const name = multiplayerService.getPlayerName();
// Returns: "DeepTyper1234" or custom name

// Update player name
try {
  const newName = multiplayerService.updatePlayerName("SpeedDemon");
  // Name updated and saved to localStorage
  // Also updated in database if in active game
} catch (error) {
  // Invalid name format
}

// Generate new random name
const randomName = multiplayerService.generatePlayerName();
// Returns: "DeepTyper7832"
```

### localStorage Storage

```javascript
// Stored as:
localStorage.setItem('deeptype_player_name', 'DeepTyper1234');

// Retrieved as:
const name = localStorage.getItem('deeptype_player_name');
```

### Component Usage

```jsx
import PlayerNameEditor from './PlayerNameEditor';

// In your component:
<PlayerNameEditor 
  onNameChange={(newName) => {
    console.log('Name changed to:', newName);
    // Optional: handle name change
  }} 
/>
```

## 🎨 UI/UX Flow

### Waiting Screen
```
⏳ Waiting for players...

Your name: [DeepTyper1234] [✎ Edit Name]

Players in room: 2/4
├─ DeepTyper1234 (You)
└─ FastTyper567

Game will start when 2+ players join
```

### Editing Name
```
Your name: [SpeedDemon___] [✓] [✕]
          3-20 characters, letters and numbers only
```

### After Save
```
Your name: [SpeedDemon] [✎ Edit Name]
```

## 🔄 Name Sync

### During Active Game
When user changes name during a game:
1. localStorage updated immediately
2. Database updated automatically
3. Other players see new name in real-time (via Supabase subscription)
4. No page refresh needed

### Between Games
- Name persists in localStorage
- Automatically used for next game
- No need to re-enter

## ⚡ Performance

### Fast & Lightweight
- No API calls to check username availability
- No database queries on page load
- Instant name generation
- localStorage is synchronous (0ms)

### No Backend Load
- No authentication system needed
- No user account management
- No password storage
- No email verification

## 🆚 Comparison: keybr.com vs DeepType

| Feature | keybr.com | DeepType |
|---------|-----------|----------|
| Random names | ✅ Yes | ✅ Yes |
| Name format | Random words | DeepTyper#### |
| Can edit | ✅ Yes | ✅ Yes |
| Persists | ✅ Yes | ✅ Yes |
| Login required | ❌ No | ❌ No |
| Storage | Browser | localStorage |

## 🎯 Benefits

### For Users
- ✅ **Zero friction** - Start playing immediately
- ✅ **Privacy** - No personal info needed
- ✅ **Simplicity** - One-click to play
- ✅ **Customization** - Change name if wanted
- ✅ **Persistence** - Name remembered

### For Developers
- ✅ **No auth system** - Save weeks of development
- ✅ **No user DB** - No user table needed
- ✅ **No security concerns** - No passwords to protect
- ✅ **Easy testing** - Open incognito = new user
- ✅ **Free** - No auth service costs

## 🔒 Privacy

### What We Store
- ✅ Player name (locally in browser)
- ✅ Game session data (temporary)

### What We DON'T Store
- ❌ Email addresses
- ❌ Passwords
- ❌ Personal information
- ❌ Tracking data
- ❌ User history (beyond current session)

### GDPR Compliant
- No PII collected
- No user tracking
- No cookies (except localStorage)
- Users fully anonymous

## 🚀 Future Enhancements (Optional)

### Phase 2 Features
If you want to add authentication later:

```javascript
// Option 1: Keep anonymous + add optional accounts
if (user.isLoggedIn) {
  // Use account name + stats
} else {
  // Use anonymous name (current system)
}

// Option 2: Link anonymous sessions to accounts
// Allow users to "claim" their anonymous games
```

### Avatar System
```javascript
// Generate avatar from name
const avatar = generateAvatarFromName(playerName);
// Show colored icon/emoji based on name
```

### Name History
```javascript
// Track name changes (optional)
localStorage.setItem('deeptype_name_history', JSON.stringify([
  { name: 'DeepTyper1234', date: '2024-10-26' },
  { name: 'SpeedDemon', date: '2024-10-27' }
]));
```

## 🐛 Edge Cases Handled

### 1. Duplicate Names
- **Allowed!** Multiple users can have same name
- System uses unique `player.id` internally
- Display shows `player_name` but tracking uses `id`

### 2. localStorage Cleared
- New random name generated automatically
- User can set preferred name again
- No data loss (fresh start)

### 3. Incognito/Private Mode
- New random name each session
- Normal functionality works
- Name not persisted (expected behavior)

### 4. Name Change Mid-Game
- Updates immediately in database
- Other players see change via real-time sync
- No game disruption

## 📊 Database Schema

```sql
-- Players table already handles this:
CREATE TABLE players (
  id UUID PRIMARY KEY,
  room_id UUID,
  player_name TEXT NOT NULL DEFAULT 'Anonymous',  -- Can be any name
  -- ... other fields
);

-- No users table needed!
-- No authentication needed!
-- Just store name in each game session
```

## ✅ Testing

### Test Scenarios

1. **New User**
   - Open app in incognito
   - Check for auto-generated name
   - Verify it's saved

2. **Returning User**
   - Close and reopen app
   - Same name should appear
   - No login prompt

3. **Name Change**
   - Edit name during waiting
   - Edit name during game
   - Verify updates everywhere

4. **Multiple Players**
   - Open 2 browser windows
   - Both get different names
   - Both can change names
   - Both see each other's names

## 🎉 Summary

**Simple. Anonymous. Instant.**

- No login barriers
- No auth complexity
- No user management
- Just type and race!

This is exactly how keybr.com does it, and it's brilliant! 🚀

---

## 📝 Quick Reference

```javascript
// Service API
multiplayerService.getPlayerName()        // Get current name
multiplayerService.updatePlayerName(name) // Change name
multiplayerService.generatePlayerName()   // Generate random

// Component
<PlayerNameEditor onNameChange={callback} />

// localStorage
localStorage.getItem('deeptype_player_name')
localStorage.setItem('deeptype_player_name', name)
```

**Ready to use!** The system is fully implemented and working. 🎮
