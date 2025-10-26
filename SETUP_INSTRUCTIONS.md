# DeepType Multiplayer Setup Instructions

## Step 1: Create Supabase Account (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Google (free)
4. Create a new project:
   - Project name: `deeptype-multiplayer`
   - Database password: (generate strong password)
   - Region: Choose closest to your users
   - Free tier is selected by default

5. Wait 2-3 minutes for project to be created

## Step 2: Setup Database (2 minutes)

1. In your Supabase project, click on "SQL Editor" in left sidebar
2. Click "New query"
3. Copy entire contents of `supabase-setup.sql` file
4. Paste into SQL Editor
5. Click "Run" button
6. You should see success message: "Supabase setup complete!"

## Step 3: Get API Keys (1 minute)

1. In Supabase, click "Project Settings" (gear icon in sidebar)
2. Click "API" in settings menu
3. Copy these two values:
   - **Project URL**: Something like `https://xxxxx.supabase.co`
   - **anon public** key: Long string starting with `eyJ...`

## Step 4: Configure Environment Variables (2 minutes)

### For Local Development:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and paste your values:
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### For Netlify Production:

1. Go to your Netlify dashboard
2. Click on your site
3. Go to "Site settings" > "Environment variables"
4. Add two new variables:
   - Key: `REACT_APP_SUPABASE_URL`, Value: (your project URL)
   - Key: `REACT_APP_SUPABASE_ANON_KEY`, Value: (your anon key)

## Step 5: Install Dependencies (1 minute)

```bash
npm install @supabase/supabase-js
```

## Step 6: Test Locally (2 minutes)

```bash
npm start
```

The app should start. Check browser console - you should NOT see any Supabase connection errors.

## Step 7: Deploy to Netlify (2 minutes)

```bash
git add .
git commit -m "Add multiplayer with Supabase"
git push
```

Netlify will automatically deploy. Check the deploy logs for any errors.

## Verify It's Working

1. Open your deployed site in TWO browser windows
2. Click "Multiplayer" (once UI is added)
3. Both windows should show "Waiting for players..."
4. Both should show each other in the player list
5. Start typing in one window - the other should see progress update

## Troubleshooting

### "Invalid API key" error:
- Double-check you copied the correct anon key
- Make sure there are no extra spaces
- Verify environment variables are set in Netlify

### Players not seeing each other:
- Check Supabase logs: Project Settings > API Logs
- Verify SQL setup ran successfully
- Check browser console for errors

### Database connection errors:
- Verify Project URL is correct
- Check that project is not paused (free tier pauses after 1 week of inactivity)

## Monitoring Usage

Free tier limits:
- 500MB database storage
- 2GB bandwidth/month
- 50,000 monthly active users

Check usage:
1. Supabase Dashboard > Home
2. See "Database" and "Bandwidth" sections

## Security Note

The current setup allows anonymous access for quick multiplayer. For production:
1. Enable Row Level Security policies (already in SQL script)
2. Add rate limiting
3. Consider adding user authentication

## Cost Breakdown

**Monthly Cost: $0** for most usage

You'll only pay if you exceed:
- 500MB database (very unlikely for just game state)
- 2GB bandwidth (≈10,000 games/month)

To stay free:
- Clean up old rooms (automated in SQL)
- Limit message frequency (already at 10/sec max)

## Support

If you have issues:
1. Check Supabase docs: https://supabase.com/docs
2. Join Supabase Discord: https://discord.supabase.com
3. GitHub issues in DeepType repo

## Next Steps

After setup complete:
1. Implement multiplayer UI components (see code files)
2. Test with friends
3. Add visual polish (animations, sounds)
4. Share and enjoy! 🎉
