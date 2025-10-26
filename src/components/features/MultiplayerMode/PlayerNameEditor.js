// PlayerNameEditor Component
// Allows users to view and edit their multiplayer name (like keybr.com)

import React, { useState } from 'react';
import multiplayerService from '../../../services/multiplayerService';

const PlayerNameEditor = ({ onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(multiplayerService.getPlayerName());
  const [tempName, setTempName] = useState(name);
  const [error, setError] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setTempName(name);
    setError('');
  };

  const handleSave = () => {
    try {
      const newName = multiplayerService.updatePlayerName(tempName);
      setName(newName);
      setIsEditing(false);
      setError('');
      if (onNameChange) {
        onNameChange(newName);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempName(name);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div style={styles.container}>
        <div style={styles.editContainer}>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyPress}
            style={styles.input}
            maxLength={20}
            autoFocus
            placeholder="Enter your name"
          />
          <button onClick={handleSave} style={styles.saveButton}>
            ✓
          </button>
          <button onClick={handleCancel} style={styles.cancelButton}>
            ✕
          </button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.hint}>3-20 characters, letters and numbers only</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.displayContainer}>
        <span style={styles.name}>{name}</span>
        <button onClick={handleEdit} style={styles.editButton}>
          ✎ Edit Name
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'inline-block',
  },
  displayContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editButton: {
    padding: '5px 12px',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#4CAF50',
    border: '1px solid #4CAF50',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  editContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  input: {
    padding: '8px 12px',
    fontSize: '16px',
    backgroundColor: '#2a2a2a',
    border: '2px solid #4CAF50',
    borderRadius: '4px',
    color: '#ffffff',
    outline: 'none',
    minWidth: '200px',
  },
  saveButton: {
    padding: '8px 14px',
    fontSize: '18px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: '8px 14px',
    fontSize: '18px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  error: {
    marginTop: '5px',
    fontSize: '12px',
    color: '#f44336',
  },
  hint: {
    marginTop: '5px',
    fontSize: '11px',
    color: '#888',
  },
};

export default PlayerNameEditor;
