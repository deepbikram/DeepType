# Multiplayer Implementation Plan for DeepType

## Chosen Approach: Supabase Real-time (FREE)

### Why Supabase?
- ✅ Free tier: 500MB database, 2GB bandwidth, unlimited API requests
- ✅ Real-time subscriptions included (WebSocket-like)
- ✅ No backend server needed - works directly from Netlify
- ✅ Simple setup: ~30 minutes
- ✅ Scales automatically

### Architecture Overview

```
[Player 1] ─┐
[Player 2] ─┼──> Supabase Real-time ──> All Players
[Player 3] ─┘     (Postgres + WebSockets)
```

### Database Schema

```sql
-- Rooms table
rooms (
  id: uuid
  text: text
  game_state: text (waiting, starting, running, finished)
  countdown: integer
  created_at: timestamp
  started_at: timestamp
)

-- Players table
players (
  id: uuid
  room_id: uuid (foreign key)
  name: text
  progress: integer (0-100)
  wpm: integer
  errors: integer
  finished: boolean
  position: integer
  joined_at: timestamp
)
```

### Implementation Steps

#### 1. Setup Supabase (5 minutes)
   - Go to https://supabase.com
   - Create free account
   - Create new project
   - Get API keys

#### 2. Install Dependencies
   ```bash
   npm install @supabase/supabase-js
   ```

#### 3. Create Files (see below)
   - src/services/supabase.js
   - src/services/multiplayerService.js
   - src/components/features/MultiplayerMode/
   - src/hooks/useMultiplayer.js

#### 4. Add Multiplayer Button to Main Menu

#### 5. Deploy to Netlify (environment variables)

### Data Flow

1. **Player Joins:**
   - Find available room (< 4 players, state = 'waiting')
   - If none exist, create new room
   - Insert player record
   - Subscribe to room updates

2. **Game Starts:**
   - When 2+ players in room
   - Server function updates countdown (3, 2, 1)
   - Game state → 'running'

3. **During Race:**
   - Player types → update their player record
   - All players subscribed → see updates instantly
   - Real-time progress bars

4. **Finish:**
   - First to 100% progress → position = 1
   - Others finish → positions assigned
   - Game state → 'finished'
   - Show results for 5 seconds
   - Return to matchmaking

### Cost Analysis
- **Supabase Free Tier:**
  - 500MB database (plenty for multiplayer state)
  - 2GB bandwidth/month (~10,000 games)
  - Unlimited API requests
  - Real-time subscriptions included

- **Netlify Free Tier:**
  - 100GB bandwidth
  - Unlimited sites
  - No additional cost for multiplayer

**Total Cost: $0/month** for low-medium traffic

### Alternative Options (if Supabase limits reached)

1. **Firebase Realtime Database**
   - Free tier: 1GB storage, 10GB/month transfer
   - Similar setup complexity

2. **PubNub** 
   - Free tier: 200 monthly active users
   - Purpose-built for real-time

3. **Ably**
   - Free tier: 3M messages/month
   - Good for scaling

### Security Considerations
- Row Level Security (RLS) policies in Supabase
- Rate limiting on updates (max 10 updates/second per player)
- Auto-cleanup of old rooms (>5 minutes old)
- Anonymous users OK (or add auth later)

### Timeline
- **Setup Supabase**: 30 minutes
- **Implement core multiplayer**: 4-6 hours
- **UI/UX polish**: 2-3 hours
- **Testing**: 1-2 hours

**Total: 1-2 days of focused work**

### Next Steps
1. Create Supabase account
2. Run SQL migrations
3. Install dependencies
4. Implement files below
5. Test locally
6. Deploy to Netlify
