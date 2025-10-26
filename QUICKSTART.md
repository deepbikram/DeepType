# ⚡ QUICKSTART - Get Multiplayer Running in 15 Minutes

## 🎯 Goal
Have 2 players racing against each other in real-time.

## 📋 Prerequisites
- ✅ You already have DeepType running locally
- ✅ You have internet connection
- ✅ You have an email address (for Supabase account)

**Note:** Users DON'T need accounts! They get random names like "DeepTyper1234" (just like keybr.com) and can change them if they want.

---

## 🚀 Step-by-Step

### ⏱️ Step 1: Install Package (1 minute)

```bash
cd /Users/dbtcmacbookpro/Desktop/deeptype
npm install
```

**Expected:** Package @supabase/supabase-js installs successfully

---

### ⏱️ Step 2: Create Supabase Account (3 minutes)

1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign up with:
   - GitHub (recommended) OR
   - Google OR
   - Email
4. Verify email if needed

**Expected:** You see Supabase dashboard

---

### ⏱️ Step 3: Create Project (2 minutes)

1. Click **"New Project"**
2. Fill in:
   - **Name**: `deeptype-multiplayer`
   - **Database Password**: Click "Generate password" and copy it somewhere safe
   - **Region**: Choose closest to you (e.g., US East, EU West)
   - **Plan**: Free (already selected)
3. Click **"Create new project"**
4. Wait 2 minutes for project to initialize (☕ coffee time!)

**Expected:** Green "Project is ready" message

---

### ⏱️ Step 4: Setup Database (2 minutes)

1. In left sidebar, click **"SQL Editor"** (looks like </> icon)
2. Click **"New query"** button
3. Open this file in a text editor:
   ```bash
   open /Users/dbtcmacbookpro/Desktop/deeptype/supabase-setup.sql
   ```
4. Copy EVERYTHING from the file (⌘+A, ⌘+C)
5. Paste into SQL Editor (⌘+V)
6. Click **"Run"** button (or press ⌘+Enter)
7. Wait 3 seconds...

**Expected:** See success message at bottom:
```
"Supabase setup complete! Your multiplayer database is ready."
```

---

### ⏱️ Step 5: Get API Keys (2 minutes)

1. Click **⚙️ Settings** in left sidebar (bottom)
2. Click **"API"** in settings menu
3. You'll see two important values:

**Project URL** (looks like this):
```
https://abcdefghijklmnop.supabase.co
```
Copy it! 📋

**anon public key** (long string starting with eyJ...):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
```
Copy it! 📋

---

### ⏱️ Step 6: Configure Environment (2 minutes)

1. In terminal:
```bash
cd /Users/dbtcmacbookpro/Desktop/deeptype
cp .env.example .env.local
```

2. Open .env.local:
```bash
open .env.local
```

3. Replace with YOUR values (paste what you copied):
```env
REACT_APP_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJI...YOUR-KEY-HERE...
```

4. Save file (⌘+S)

---

### ⏱️ Step 7: Test It! (2 minutes)

1. Start the app:
```bash
npm start
```

2. Check browser console (F12 or Option+Cmd+J)
   - ✅ **Good:** No red errors
   - ❌ **Bad:** "Invalid API key" → Check .env.local

3. Open Supabase → **Table Editor** → See `rooms` and `players` tables

**Expected:** App runs, no Supabase errors in console

---

### ⏱️ Step 8: Verify Database (1 minute)

Quick test that everything is connected:

1. In Supabase dashboard, go to **Table Editor**
2. Click **"rooms"** table
3. Click **"Insert row"** button
4. Fill in:
   - text: "test"
   - game_state: "waiting"
5. Click **"Save"**
6. See your row appear!
7. Delete it (optional)

**Expected:** You can insert and see data

---

## ✅ Success! Backend is Ready!

You now have:
- ✅ Supabase account
- ✅ Database created with schema
- ✅ API keys configured
- ✅ App connected to database
- ✅ No errors in console

**Time taken:** ~15 minutes

---

## 🎨 Next: Build the UI

The backend works! Now you need to create the UI components.

**Option 1: Use Example Component**
```bash
# The example file is already created at:
# src/components/features/MultiplayerMode/MultiplayerRace.example.js

# Rename it to use it:
cd src/components/features/MultiplayerMode/
mv MultiplayerRace.example.js MultiplayerRace.js
```

**Option 2: Build Custom UI**
Follow the `CHECKLIST.md` to build your own UI

---

## 🧪 Test Multiplayer

### Quick Test (Without UI)

1. Open browser console (F12)
2. Paste this:

```javascript
// Import service (if using React DevTools)
const multiplayerService = await import('./services/multiplayerService').then(m => m.default);

// Join a room
await multiplayerService.joinMatchmaking('test text');

// See your player
console.log('My player ID:', multiplayerService.currentPlayerId);
console.log('My room ID:', multiplayerService.currentRoomId);

// Get players in room
const players = await multiplayerService.getPlayers(multiplayerService.currentRoomId);
console.log('Players:', players);
```

3. Open another browser window
4. Repeat step 2
5. Both windows should see each other!

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
**Fix:** 
1. Check .env.local has correct keys
2. Restart npm (Ctrl+C, then npm start)
3. Clear browser cache

### Error: "Network request failed"
**Fix:**
1. Check internet connection
2. Verify Supabase project is active (not paused)
3. Check Project URL is correct

### Tables not found
**Fix:**
1. Go to Supabase SQL Editor
2. Re-run supabase-setup.sql
3. Check for red error messages

### .env.local not working
**Fix:**
1. Make sure file is named exactly `.env.local` (with the dot)
2. Restart development server
3. Don't commit .env.local to git (it's in .gitignore)

---

## 📞 Need Help?

**Check these files:**
- `START_HERE.md` - Overview
- `SETUP_INSTRUCTIONS.md` - Detailed guide
- `CHECKLIST.md` - Track progress

**Still stuck?**
- Check browser console for errors
- Check Supabase logs: Project Settings → Logs
- Supabase Discord: https://discord.supabase.com

---

## 🎉 What's Next?

Now that backend works:

1. **Today:** Build basic multiplayer UI (2-3 hours)
2. **Tomorrow:** Test with friends
3. **This week:** Polish and deploy to Netlify

Check `CHECKLIST.md` for detailed tasks!

---

## 📊 Your Progress

- [x] Dependencies installed
- [x] Supabase account created
- [x] Database schema deployed
- [x] Environment configured
- [x] Connection tested
- [ ] UI components built
- [ ] Tested with 2 players
- [ ] Deployed to Netlify

**You're 60% done! Keep going! 🚀**

---

Good luck! You've got this! 💪
