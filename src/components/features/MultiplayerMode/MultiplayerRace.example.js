// Example: Basic Multiplayer Component for DeepType
// This is a starting point - customize to match your design!

import React, { useState, useEffect } from 'react';
import multiplayerService from '../../services/multiplayerService';
import PlayerNameEditor from './PlayerNameEditor';

const MultiplayerRace = () => {
  const [gameState, setGameState] = useState('connecting'); // connecting, waiting, starting, running, finished
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [myProgress, setMyProgress] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState(multiplayerService.getPlayerName());

  useEffect(() => {
    initializeMultiplayer();
    
    return () => {
      // Cleanup when leaving
      multiplayerService.leaveRoom();
    };
  }, []);

  const initializeMultiplayer = async () => {
    try {
      // Sample text - replace with your text generation logic
      const text = 'The quick brown fox jumps over the lazy dog. This is a sample typing test.';
      
      // Join matchmaking
      const { roomId } = await multiplayerService.joinMatchmaking(text);
      setCurrentText(text);
      setGameState('waiting');
      
      // Subscribe to room updates
      multiplayerService.subscribeToRoom(roomId, handleRoomUpdate);
      
      // Subscribe to player updates
      multiplayerService.subscribeToPlayers(roomId, handlePlayersUpdate);
      
      // Get initial data
      const roomData = await multiplayerService.getRoom(roomId);
      const playersData = await multiplayerService.getPlayers(roomId);
      
      setRoom(roomData);
      setPlayers(playersData);
      
    } catch (err) {
      console.error('Failed to initialize multiplayer:', err);
      setError('Failed to connect to multiplayer. Please try again.');
      setGameState('error');
    }
  };

  const handleRoomUpdate = (roomData) => {
    setRoom(roomData);
    setGameState(roomData.game_state);
    setCountdown(roomData.countdown);
  };

  const handlePlayersUpdate = (playersData) => {
    setPlayers(playersData);
  };

  const handleTyping = (typedText) => {
    // Calculate progress (0-100)
    const progress = Math.floor((typedText.length / currentText.length) * 100);
    
    // Calculate WPM (implement your WPM calculation)
    const wpm = calculateWPM(typedText);
    
    // Calculate errors (implement your error tracking)
    const errors = calculateErrors(typedText, currentText);
    
    // Update progress
    multiplayerService.updateProgress(
      multiplayerService.currentPlayerId,
      progress,
      wpm,
      errors
    );
    
    setMyProgress(progress);
  };

  const calculateWPM = (typedText) => {
    // Implement your WPM calculation
    // This is a placeholder
    return Math.floor(typedText.length / 5 * 12); // Rough estimate
  };

  const calculateErrors = (typed, original) => {
    // Implement your error calculation
    // This is a placeholder
    let errors = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== original[i]) errors++;
    }
    return errors;
  };

  // Render different states
  if (gameState === 'connecting') {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          <h2>🔄 Connecting to multiplayer...</h2>
        </div>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          <h2>❌ {error}</h2>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          <h2>⏳ Waiting for players...</h2>
          
          {/* Player Name Editor */}
          <div style={styles.nameSection}>
            <span style={styles.nameLabel}>Your name: </span>
            <PlayerNameEditor 
              onNameChange={(newName) => {
                setPlayerName(newName);
                // Name will auto-update in database via multiplayerService
              }} 
            />
          </div>

          <p>Players in room: {players.length}/4</p>
          <div style={styles.playerList}>
            {players.map(player => (
              <div key={player.id} style={styles.playerItem}>
                {player.player_name}
                {player.id === multiplayerService.currentPlayerId && ' (You)'}
              </div>
            ))}
          </div>
          <p style={styles.hint}>Game will start when 2+ players join</p>
        </div>
      </div>
    );
  }

  if (gameState === 'starting') {
    return (
      <div style={styles.container}>
        <div style={styles.countdown}>
          <h1 style={styles.countdownNumber}>{countdown || 'GO!'}</h1>
        </div>
      </div>
    );
  }

  if (gameState === 'running') {
    return (
      <div style={styles.container}>
        <div style={styles.gameArea}>
          {/* Player progress bars */}
          <div style={styles.playersContainer}>
            {players.map(player => (
              <div key={player.id} style={styles.playerProgress}>
                <div style={styles.playerInfo}>
                  <span>{player.player_name}</span>
                  <span>{player.wpm} WPM</span>
                  <span>#{player.position}</span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${player.progress}%`,
                      backgroundColor: player.id === multiplayerService.currentPlayerId 
                        ? '#4CAF50' 
                        : '#2196F3'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Typing area - integrate with your existing TypeBox component */}
          <div style={styles.typingArea}>
            <p style={styles.text}>{currentText}</p>
            <input
              type="text"
              placeholder="Start typing..."
              onChange={(e) => handleTyping(e.target.value)}
              style={styles.input}
              autoFocus
            />
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const winner = players.find(p => p.position === 1);
    const isWinner = winner?.id === multiplayerService.currentPlayerId;

    return (
      <div style={styles.container}>
        <div style={styles.results}>
          <h1>{isWinner ? '🏆 You Won!' : '🏁 Race Finished!'}</h1>
          <h2>Final Results:</h2>
          <div style={styles.leaderboard}>
            {players
              .sort((a, b) => a.position - b.position)
              .map((player, index) => (
                <div key={player.id} style={styles.leaderboardItem}>
                  <span style={styles.position}>#{index + 1}</span>
                  <span style={styles.name}>{player.player_name}</span>
                  <span style={styles.stats}>{player.wpm} WPM</span>
                  <span style={styles.stats}>{player.errors} errors</span>
                </div>
              ))}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={styles.button}
          >
            Race Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// Basic styles - customize to match your design
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  },
  message: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    maxWidth: '500px',
  },
  playerList: {
    marginTop: '20px',
  },
  playerItem: {
    padding: '10px',
    marginBottom: '5px',
    backgroundColor: '#3a3a3a',
    borderRadius: '6px',
  },
  hint: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#888',
  },
  nameSection: {
    margin: '20px 0',
    padding: '15px',
    backgroundColor: '#3a3a3a',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  nameLabel: {
    fontSize: '16px',
    color: '#aaa',
  },
  countdown: {
    textAlign: 'center',
  },
  countdownNumber: {
    fontSize: '120px',
    fontWeight: 'bold',
    animation: 'pulse 1s infinite',
  },
  gameArea: {
    width: '100%',
    maxWidth: '1200px',
  },
  playersContainer: {
    marginBottom: '40px',
  },
  playerProgress: {
    marginBottom: '15px',
  },
  playerInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    fontSize: '14px',
  },
  progressBar: {
    width: '100%',
    height: '30px',
    backgroundColor: '#3a3a3a',
    borderRadius: '15px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  typingArea: {
    marginTop: '40px',
  },
  text: {
    fontSize: '24px',
    lineHeight: '1.6',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
  },
  input: {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    backgroundColor: '#2a2a2a',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    color: '#ffffff',
    outline: 'none',
  },
  results: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    maxWidth: '600px',
  },
  leaderboard: {
    marginTop: '30px',
    marginBottom: '30px',
  },
  leaderboardItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: '#3a3a3a',
    borderRadius: '8px',
  },
  position: {
    fontWeight: 'bold',
    width: '50px',
  },
  name: {
    flex: 1,
    textAlign: 'left',
  },
  stats: {
    width: '100px',
  },
  button: {
    padding: '15px 40px',
    fontSize: '18px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default MultiplayerRace;
