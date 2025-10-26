import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, LinearProgress, Paper, Chip, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HomeIcon from '@mui/icons-material/Home';
import multiplayerService from '../../../services/multiplayerService';
import PlayerNameEditor from './PlayerNameEditor';
import { wordsGenerator } from '../../../scripts/wordsGenerator';
import { ENGLISH_MODE } from '../../../constants/Constants';

const Container = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GameCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(26, 26, 46, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '40px',
  maxWidth: '1200px',
  width: '100%',
  boxShadow: '0 8px 32px 0 rgba(167, 139, 250, 0.2)',
  border: '1px solid rgba(167, 139, 250, 0.1)',
}));

const PlayerCard = styled(Box)(({ isCurrentPlayer }) => ({
  background: isCurrentPlayer 
    ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)'
    : 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
  border: isCurrentPlayer ? '2px solid #a78bfa' : '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(167, 139, 250, 0.3)',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    background: 'linear-gradient(90deg, #a78bfa 0%, #8b5cf6 100%)',
  },
}));

const TypeInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '20px',
  fontSize: '20px',
  backgroundColor: 'rgba(26, 26, 46, 0.8)',
  border: '2px solid #a78bfa',
  borderRadius: '12px',
  color: '#ffffff',
  outline: 'none',
  fontFamily: 'Roboto Mono, monospace',
  transition: 'all 0.3s ease',
  '&:focus': {
    borderColor: '#8b5cf6',
    boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
  },
}));

const TextDisplay = styled(Box)(({ theme }) => ({
  fontSize: '24px',
  lineHeight: '1.8',
  padding: '30px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  marginBottom: '24px',
  fontFamily: 'Roboto Mono, monospace',
  color: '#e0e0e0',
  letterSpacing: '0.5px',
  userSelect: 'none',
}));

const CountdownDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '120px',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'pulse 1s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.8, transform: 'scale(1.1)' },
  },
}));

const MultiplayerRace = ({ onNavigateHome }) => {
  const [gameState, setGameState] = useState('connecting');
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [errors, setErrors] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleRoomUpdate = React.useCallback((roomData) => {
    setGameState(roomData.game_state);
    setCountdown(roomData.countdown);
    
    if (roomData.game_state === 'running' && !startTime) {
      setStartTime(Date.now());
    }
  }, [startTime]);

  const handlePlayersUpdate = React.useCallback((playersData) => {
    setPlayers(playersData);
  }, []);

  useEffect(() => {
    const initializeMultiplayer = async () => {
      try {
        // Generate words for the race
        const { words } = wordsGenerator(50, ENGLISH_MODE, false);
        const text = words.join(' ');
        
        // Join matchmaking
        const { roomId } = await multiplayerService.joinMatchmaking(text);
        setCurrentText(text);
        setGameState('waiting');
        
        // Subscribe to room updates
        multiplayerService.subscribeToRoom(roomId, handleRoomUpdate);
        
        // Subscribe to player updates
        multiplayerService.subscribeToPlayers(roomId, handlePlayersUpdate);
        
        // Get initial data
        const playersData = await multiplayerService.getPlayers(roomId);
        
        if (playersData) setPlayers(playersData);
        
      } catch (err) {
        console.error('Failed to initialize multiplayer:', err);
        setError('Failed to connect to multiplayer. Please check your Supabase configuration.');
        setGameState('error');
      }
    };

    initializeMultiplayer();
    
    return () => {
      multiplayerService.leaveRoom();
    };
  }, [handleRoomUpdate, handlePlayersUpdate]);

  useEffect(() => {
    if (gameState === 'running' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  const handleTyping = (e) => {
    const typed = e.target.value;
    setTypedText(typed);

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Calculate progress (0-100)
    const progress = Math.min(100, Math.floor((typed.length / currentText.length) * 100));
    
    // Calculate WPM
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const wordsTyped = typed.trim().split(/\s+/).length;
    const wpm = Math.floor(wordsTyped / (timeElapsed || 0.01));
    
    // Calculate errors
    let errorCount = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== currentText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);
    
    // Update progress in real-time
    if (multiplayerService.currentPlayerId) {
      multiplayerService.updateProgress(
        multiplayerService.currentPlayerId,
        progress,
        wpm,
        errorCount
      );
    }

    // Check if finished
    if (typed === currentText) {
      handleFinish(wpm, errorCount);
    }
  };

  const handleFinish = (finalWpm, finalErrors) => {
    // Player finished!
    console.log('Finished!', { wpm: finalWpm, errors: finalErrors });
  };

  const handleNavigateHomeClick = () => {
    multiplayerService.leaveRoom();
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  // Render connecting state
  if (gameState === 'connecting') {
    return (
      <Container>
        <GameCard>
          <Box textAlign="center" py={4}>
            <Typography variant="h3" gutterBottom sx={{ color: '#a78bfa' }}>
              🔄 Connecting to multiplayer...
            </Typography>
            <LinearProgress sx={{ mt: 3, borderRadius: 1 }} />
          </Box>
        </GameCard>
      </Container>
    );
  }

  // Render error state
  if (gameState === 'error') {
    return (
      <Container>
        <GameCard>
          <Box textAlign="center" py={4}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#ffffff' }}>
              Connection Failed
            </Typography>
            <Typography variant="body1" sx={{ color: '#9ca3af', mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              startIcon={<PlayArrowIcon />}
              sx={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                color: '#ffffff',
                px: 4,
                py: 1.5,
                fontSize: '16px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                },
              }}
            >
              Try Again
            </Button>
          </Box>
        </GameCard>
      </Container>
    );
  }

  // Render waiting state
  if (gameState === 'waiting') {
    return (
      <Container>
        <GameCard>
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom sx={{ color: '#ffffff', mb: 3 }}>
              ⏳ Waiting Room
            </Typography>
            
            {/* Player Name Editor */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2,
              mb: 4,
              p: 2,
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
              borderRadius: '12px',
            }}>
              <Typography sx={{ color: '#a78bfa', fontSize: '18px' }}>
                Your name:
              </Typography>
              <PlayerNameEditor 
                onNameChange={() => {
                  // Name updates automatically via multiplayerService
                }} 
              />
            </Box>

            <Typography variant="h5" sx={{ color: '#9ca3af', mb: 3 }}>
              Players in room: {players.length}/4
            </Typography>

            {/* Player List */}
            <Box sx={{ maxWidth: '600px', margin: '0 auto', mb: 4 }}>
              {players.map((player) => (
                <PlayerCard 
                  key={player.id} 
                  isCurrentPlayer={player.id === multiplayerService.currentPlayerId}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <PersonIcon sx={{ color: '#a78bfa' }} />
                    <Typography sx={{ color: '#ffffff', flex: 1, fontSize: '18px' }}>
                      {player.player_name}
                      {player.id === multiplayerService.currentPlayerId && ' (You)'}
                    </Typography>
                    {player.id === multiplayerService.currentPlayerId && (
                      <Chip 
                        label="YOU" 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                          color: '#ffffff',
                          fontWeight: 'bold',
                        }} 
                      />
                    )}
                  </Box>
                </PlayerCard>
              ))}
            </Box>

            <Typography variant="body1" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
              Game will start when 2+ players join...
            </Typography>

            <Button
              variant="outlined"
              onClick={handleNavigateHomeClick}
              startIcon={<HomeIcon />}
              sx={{
                mt: 4,
                color: '#a78bfa',
                borderColor: '#a78bfa',
                '&:hover': {
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(167, 139, 250, 0.1)',
                },
              }}
            >
              Leave Room
            </Button>
          </Box>
        </GameCard>
      </Container>
    );
  }

  // Render countdown state
  if (gameState === 'starting') {
    return (
      <Container>
        <GameCard>
          <Box textAlign="center" py={8}>
            <Typography variant="h4" gutterBottom sx={{ color: '#a78bfa', mb: 4 }}>
              Get Ready!
            </Typography>
            <CountdownDisplay>
              {countdown || 'GO!'}
            </CountdownDisplay>
          </Box>
        </GameCard>
      </Container>
    );
  }

  // Render running state
  if (gameState === 'running') {
    return (
      <Container>
        <GameCard>
          <Typography variant="h4" gutterBottom sx={{ color: '#ffffff', mb: 3, textAlign: 'center' }}>
            🏁 Race in Progress!
          </Typography>

          {/* Player Progress Bars */}
          <Box sx={{ mb: 4 }}>
            {players.map((player) => (
              <PlayerCard 
                key={player.id} 
                isCurrentPlayer={player.id === multiplayerService.currentPlayerId}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon sx={{ color: '#a78bfa' }} />
                    <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      {player.player_name}
                    </Typography>
                    {player.id === multiplayerService.currentPlayerId && (
                      <Chip 
                        label="YOU" 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                          color: '#ffffff',
                          fontSize: '10px',
                          height: '20px',
                        }} 
                      />
                    )}
                  </Box>
                  <Box display="flex" gap={2}>
                    <Tooltip title="Words Per Minute">
                      <Chip 
                        icon={<SpeedIcon sx={{ color: '#ffffff !important' }} />}
                        label={`${player.wpm || 0} WPM`}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(167, 139, 250, 0.2)',
                          color: '#ffffff',
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Position">
                      <Chip 
                        label={`#${player.position || '-'}`}
                        size="small"
                        sx={{ 
                          backgroundColor: player.position === 1 
                            ? 'rgba(251, 191, 36, 0.3)'
                            : 'rgba(167, 139, 250, 0.2)',
                          color: player.position === 1 ? '#fbbf24' : '#ffffff',
                        }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
                <ProgressBar variant="determinate" value={player.progress || 0} />
              </PlayerCard>
            ))}
          </Box>

          {/* Typing Area */}
          <TextDisplay>
            {currentText.split('').map((char, index) => {
              let color = '#6b7280'; //未输入的字符
              if (index < typedText.length) {
                color = typedText[index] === char ? '#10b981' : '#ef4444'; // 正确:绿色, 错误:红色
              }
              return (
                <span key={index} style={{ color }}>
                  {char}
                </span>
              );
            })}
          </TextDisplay>

          <TypeInput
            ref={inputRef}
            type="text"
            value={typedText}
            onChange={handleTyping}
            placeholder="Start typing..."
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          {/* Stats */}
          <Box display="flex" justifyContent="center" gap={3} mt={3}>
            <Chip
              icon={<SpeedIcon sx={{ color: '#ffffff !important' }} />}
              label={`${Math.floor((typedText.trim().split(/\s+/).length / ((Date.now() - startTime) / 1000 / 60)) || 0)} WPM`}
              sx={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontSize: '16px',
                px: 2,
                py: 3,
              }}
            />
            <Chip
              icon={<ErrorOutlineIcon sx={{ color: '#ffffff !important' }} />}
              label={`${errors} Errors`}
              sx={{
                background: errors > 0 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '16px',
                px: 2,
                py: 3,
              }}
            />
          </Box>
        </GameCard>
      </Container>
    );
  }

  // Render finished state
  if (gameState === 'finished') {
    const sortedPlayers = [...players].sort((a, b) => (a.position || 999) - (b.position || 999));
    const winner = sortedPlayers[0];
    const isWinner = winner?.id === multiplayerService.currentPlayerId;

    return (
      <Container>
        <GameCard>
          <Box textAlign="center">
            <Box mb={4}>
              {isWinner && <EmojiEventsIcon sx={{ fontSize: 100, color: '#fbbf24', mb: 2 }} />}
              <Typography variant="h2" gutterBottom sx={{ 
                color: isWinner ? '#fbbf24' : '#ffffff',
                fontWeight: 'bold',
              }}>
                {isWinner ? '🏆 You Won!' : '🏁 Race Finished!'}
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ color: '#a78bfa', mb: 3 }}>
              Final Results
            </Typography>

            {/* Leaderboard */}
            <Box sx={{ maxWidth: '700px', margin: '0 auto', mb: 4 }}>
              {sortedPlayers.map((player, index) => (
                <PlayerCard 
                  key={player.id}
                  isCurrentPlayer={player.id === multiplayerService.currentPlayerId}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography sx={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        color: index === 0 ? '#fbbf24' : index === 1 ? '#e5e7eb' : index === 2 ? '#cd7f32' : '#9ca3af',
                        minWidth: '40px',
                      }}>
                        #{index + 1}
                      </Typography>
                      <PersonIcon sx={{ color: '#a78bfa' }} />
                      <Typography sx={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>
                        {player.player_name}
                        {player.id === multiplayerService.currentPlayerId && ' (You)'}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Chip
                        icon={<SpeedIcon sx={{ color: '#ffffff !important' }} />}
                        label={`${player.wpm || 0} WPM`}
                        sx={{
                          backgroundColor: 'rgba(167, 139, 250, 0.3)',
                          color: '#ffffff',
                          fontSize: '14px',
                        }}
                      />
                      <Chip
                        icon={<ErrorOutlineIcon sx={{ color: '#ffffff !important' }} />}
                        label={`${player.errors || 0} errors`}
                        sx={{
                          backgroundColor: player.errors > 0
                            ? 'rgba(239, 68, 68, 0.3)'
                            : 'rgba(16, 185, 129, 0.3)',
                          color: '#ffffff',
                          fontSize: '14px',
                        }}
                      />
                    </Box>
                  </Box>
                </PlayerCard>
              ))}
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                startIcon={<PlayArrowIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  px: 4,
                  py: 1.5,
                  fontSize: '16px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  },
                }}
              >
                Race Again
              </Button>
              <Button
                variant="outlined"
                onClick={handleNavigateHomeClick}
                startIcon={<HomeIcon />}
                sx={{
                  color: '#a78bfa',
                  borderColor: '#a78bfa',
                  px: 4,
                  py: 1.5,
                  fontSize: '16px',
                  '&:hover': {
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(167, 139, 250, 0.1)',
                  },
                }}
              >
                Go Home
              </Button>
            </Box>
          </Box>
        </GameCard>
      </Container>
    );
  }

  return null;
};

export default MultiplayerRace;
