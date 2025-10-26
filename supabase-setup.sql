-- Supabase SQL Setup for DeepType Multiplayer
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  game_state TEXT NOT NULL DEFAULT 'waiting', -- waiting, starting, running, finished
  countdown INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL DEFAULT 'Anonymous',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  wpm INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  finished BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_rooms_game_state ON rooms(game_state);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_players_progress ON players(progress);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow anyone to read/write (for anonymous multiplayer)
-- You can make this more restrictive later with authentication

-- Rooms: Anyone can read
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  USING (true);

-- Rooms: Anyone can insert
CREATE POLICY "Anyone can create rooms"
  ON rooms FOR INSERT
  WITH CHECK (true);

-- Rooms: Anyone can update (for game state changes)
CREATE POLICY "Anyone can update rooms"
  ON rooms FOR UPDATE
  USING (true);

-- Players: Anyone can read
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

-- Players: Anyone can insert
CREATE POLICY "Anyone can join as player"
  ON players FOR INSERT
  WITH CHECK (true);

-- Players: Anyone can update their own progress
CREATE POLICY "Anyone can update players"
  ON players FOR UPDATE
  USING (true);

-- Players: Anyone can delete (for leaving game)
CREATE POLICY "Anyone can leave game"
  ON players FOR DELETE
  USING (true);

-- Function to clean up old rooms (rooms older than 10 minutes with no activity)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '10 minutes'
    AND game_state IN ('waiting', 'finished');
END;
$$ LANGUAGE plpgsql;

-- Function to get available room or create new one
CREATE OR REPLACE FUNCTION find_or_create_room(p_text TEXT)
RETURNS UUID AS $$
DECLARE
  v_room_id UUID;
  v_player_count INTEGER;
BEGIN
  -- Try to find an available room
  SELECT r.id INTO v_room_id
  FROM rooms r
  LEFT JOIN players p ON r.id = p.room_id
  WHERE r.game_state = 'waiting'
    AND r.created_at > NOW() - INTERVAL '5 minutes'
  GROUP BY r.id
  HAVING COUNT(p.id) < r.max_players
  ORDER BY r.created_at DESC
  LIMIT 1;

  -- If no room found, create new one
  IF v_room_id IS NULL THEN
    INSERT INTO rooms (text, game_state)
    VALUES (p_text, 'waiting')
    RETURNING id INTO v_room_id;
  END IF;

  RETURN v_room_id;
END;
$$ LANGUAGE plpgsql;

-- Function to start game countdown when 2+ players
CREATE OR REPLACE FUNCTION check_and_start_game(p_room_id UUID)
RETURNS void AS $$
DECLARE
  v_player_count INTEGER;
  v_game_state TEXT;
BEGIN
  SELECT game_state INTO v_game_state
  FROM rooms
  WHERE id = p_room_id;

  IF v_game_state != 'waiting' THEN
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_player_count
  FROM players
  WHERE room_id = p_room_id;

  IF v_player_count >= 2 THEN
    UPDATE rooms
    SET game_state = 'starting',
        countdown = 3
    WHERE id = p_room_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update player position based on progress
CREATE OR REPLACE FUNCTION update_player_positions(p_room_id UUID)
RETURNS void AS $$
BEGIN
  WITH ranked_players AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY progress DESC, last_update ASC) as new_position
    FROM players
    WHERE room_id = p_room_id
      AND NOT finished
  )
  UPDATE players p
  SET position = rp.new_position
  FROM ranked_players rp
  WHERE p.id = rp.id;
END;
$$ LANGUAGE plpgsql;

-- Create a view for room details with player count
CREATE OR REPLACE VIEW room_details AS
SELECT 
  r.*,
  COUNT(p.id) as player_count,
  ARRAY_AGG(
    jsonb_build_object(
      'id', p.id,
      'name', p.player_name,
      'progress', p.progress,
      'wpm', p.wpm,
      'position', p.position,
      'finished', p.finished
    ) ORDER BY p.position
  ) FILTER (WHERE p.id IS NOT NULL) as players
FROM rooms r
LEFT JOIN players p ON r.id = p.room_id
GROUP BY r.id;

-- Grant permissions
GRANT ALL ON rooms TO anon, authenticated;
GRANT ALL ON players TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rooms() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION find_or_create_room(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_and_start_game(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_player_positions(UUID) TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Supabase setup complete! Your multiplayer database is ready.';
END $$;
