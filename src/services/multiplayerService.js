// Multiplayer Service for DeepType using Supabase
import { supabase } from './supabase';

class MultiplayerService {
  constructor() {
    this.currentRoomId = null;
    this.currentPlayerId = null;
    this.playerName = this.loadOrGeneratePlayerName();
    this.roomSubscription = null;
    this.playersSubscription = null;
  }

  // Load player name from localStorage or generate new one
  loadOrGeneratePlayerName() {
    const stored = localStorage.getItem('deeptype_player_name');
    if (stored) {
      return stored;
    }
    return this.generatePlayerName();
  }

  // Generate random player name like "DeepTyper123"
  generatePlayerName() {
    const num = Math.floor(Math.random() * 9999) + 1;
    const name = `DeepTyper${num}`;
    this.savePlayerName(name);
    return name;
  }

  // Save player name to localStorage
  savePlayerName(name) {
    localStorage.setItem('deeptype_player_name', name);
    this.playerName = name;
  }

  // Update player name (user can change it)
  updatePlayerName(newName) {
    // Validate name (3-20 characters, alphanumeric + spaces)
    const trimmed = newName.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      throw new Error('Name must be between 3 and 20 characters');
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmed)) {
      throw new Error('Name can only contain letters, numbers, and spaces');
    }
    
    this.savePlayerName(trimmed);
    
    // Update in database if currently in a game
    if (this.currentPlayerId) {
      this.updatePlayerNameInDatabase(trimmed);
    }
    
    return trimmed;
  }

  // Update name in database
  async updatePlayerNameInDatabase(newName) {
    try {
      await supabase
        .from('players')
        .update({ player_name: newName })
        .eq('id', this.currentPlayerId);
    } catch (error) {
      console.error('Error updating player name:', error);
    }
  }

  // Get current player name
  getPlayerName() {
    return this.playerName;
  }

  // Find or create a room and join it
  async joinMatchmaking(text) {
    try {
      // Clean up old rooms first
      await this.cleanupOldRooms();

      // Find available room or create new one
      const { data: room, error: roomError } = await supabase
        .rpc('find_or_create_room', { p_text: text });

      if (roomError) {
        // Fallback: try to find room manually or create one
        const availableRoom = await this.findAvailableRoom();
        this.currentRoomId = availableRoom?.id || await this.createRoom(text);
      } else {
        this.currentRoomId = room;
      }

      // Join the room as a player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: this.currentRoomId,
          player_name: this.playerName,
          progress: 0,
          wpm: 0,
          errors: 0
        })
        .select()
        .single();

      if (playerError) throw playerError;

      this.currentPlayerId = player.id;

      // Check if game should start
      await supabase.rpc('check_and_start_game', { p_room_id: this.currentRoomId });

      return {
        roomId: this.currentRoomId,
        playerId: this.currentPlayerId,
        playerName: this.playerName
      };
    } catch (error) {
      console.error('Error joining matchmaking:', error);
      throw error;
    }
  }

  // Subscribe to room updates
  subscribeToRoom(roomId, onRoomUpdate) {
    this.roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          onRoomUpdate(payload.new);
        }
      )
      .subscribe();

    return this.roomSubscription;
  }

  // Subscribe to players updates
  subscribeToPlayers(roomId, onPlayersUpdate) {
    this.playersSubscription = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          // Fetch all players when any player changes
          const players = await this.getPlayers(roomId);
          onPlayersUpdate(players);
        }
      )
      .subscribe();

    return this.playersSubscription;
  }

  // Update player progress
  async updateProgress(playerId, progress, wpm, errors) {
    try {
      const { error } = await supabase
        .from('players')
        .update({
          progress: Math.min(100, Math.max(0, progress)),
          wpm: wpm,
          errors: errors,
          finished: progress >= 100,
          last_update: new Date().toISOString()
        })
        .eq('id', playerId);

      if (error) throw error;

      // Update positions
      if (this.currentRoomId) {
        await supabase.rpc('update_player_positions', { 
          p_room_id: this.currentRoomId 
        });
      }

      // Check if player finished first
      if (progress >= 100) {
        await this.checkGameFinished();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  // Get current room data
  async getRoom(roomId) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get all players in room
  async getPlayers(roomId) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Find available room
  async findAvailableRoom() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*, players(count)')
      .eq('game_state', 'waiting')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(1)
      .single();

    if (error || !data) return null;
    
    // Check if room has space
    const playerCount = data.players?.[0]?.count || 0;
    return playerCount < 4 ? data : null;
  }

  // Create new room
  async createRoom(text) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        text: text,
        game_state: 'waiting',
        countdown: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  // Check if all players finished
  async checkGameFinished() {
    if (!this.currentRoomId) return;

    const players = await this.getPlayers(this.currentRoomId);
    const allFinished = players.every(p => p.finished);

    if (allFinished) {
      await supabase
        .from('rooms')
        .update({
          game_state: 'finished',
          finished_at: new Date().toISOString()
        })
        .eq('id', this.currentRoomId);
    }
  }

  // Leave current room
  async leaveRoom() {
    try {
      if (this.currentPlayerId) {
        await supabase
          .from('players')
          .delete()
          .eq('id', this.currentPlayerId);
      }

      // Unsubscribe from channels
      if (this.roomSubscription) {
        await supabase.removeChannel(this.roomSubscription);
      }
      if (this.playersSubscription) {
        await supabase.removeChannel(this.playersSubscription);
      }

      this.currentRoomId = null;
      this.currentPlayerId = null;
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  // Clean up old rooms
  async cleanupOldRooms() {
    try {
      await supabase.rpc('cleanup_old_rooms');
    } catch (error) {
      console.error('Error cleaning up rooms:', error);
    }
  }

  // Get current player data
  async getCurrentPlayer() {
    if (!this.currentPlayerId) return null;

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', this.currentPlayerId)
      .single();

    if (error) return null;
    return data;
  }
}

const multiplayerService = new MultiplayerService();
export default multiplayerService;
