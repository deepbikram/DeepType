import React, { useState, useRef, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { defaultTheme, themesOptions } from "./style/theme";
import { GlobalStyles } from "./style/global";
import TypeBox from "./components/features/TypeBox/TypeBox";
import SentenceBox from "./components/features/SentenceBox/SentenceBox";
import Logo from "./components/common/Logo";
import MusicPlayerSnackbar from "./components/features/MusicPlayer/MusicPlayerSnackbar";
import FooterMenu from "./components/common/FooterMenu";
import FreeTypingBox from "./components/features/FreeTypingBox";
import {
  GAME_MODE,
  GAME_MODE_DEFAULT,
  GAME_MODE_SENTENCE,
} from "./constants/Constants";
import useLocalPersistState from "./hooks/useLocalPersistState";
import DefaultKeyboard from "./components/features/Keyboard/DefaultKeyboard";
import WordsCard from "./components/features/WordsCard/WordsCard";
import {
  SOUND_MODE,
  soundOptions,
  DEFAULT_SOUND_TYPE,
  DEFAULT_SOUND_TYPE_KEY,
} from "./components/features/sound/sound";
import DynamicBackground from "./components/common/DynamicBackground";

function App() {
  // localStorage persist theme setting
  const [theme, setTheme] = useState(() => {
    try {
      const stickyTheme = window.localStorage.getItem("theme");
      if (stickyTheme !== null && stickyTheme !== "undefined") {
        const localTheme = JSON.parse(stickyTheme);
        // Check if localTheme is a valid object with label property
        if (localTheme && typeof localTheme === 'object' && localTheme.label) {
          const matchedTheme = themesOptions.find(
            (e) => e.label === localTheme.label
          );
          if (matchedTheme) {
            return matchedTheme.value;
          }
        }
      }
    } catch (error) {
      console.error("Error parsing theme from localStorage, using default:", error);
      // Clear invalid theme data
      window.localStorage.removeItem("theme");
    }
    return defaultTheme;
  });

  // local persist game mode setting
  const [soundMode, setSoundMode] = useLocalPersistState(false, SOUND_MODE);

  const [soundType, setSoundType] = useLocalPersistState(
    DEFAULT_SOUND_TYPE,
    DEFAULT_SOUND_TYPE_KEY
  );

  // local persist game mode setting
  const [gameMode, setGameMode] = useLocalPersistState(
    GAME_MODE_DEFAULT,
    GAME_MODE
  );

  const handleGameModeChange = (currGameMode) => {
    setGameMode(currGameMode);
  };

  // Add a restart key to force component remount
  const [restartKey, setRestartKey] = useState(0);

  const handleNavigateHome = () => {
    // Reset to default word game mode
    setGameMode(GAME_MODE_DEFAULT);
    // Reset all special modes
    setIsCoffeeMode(false);
    setIsTrainerMode(false);
    setIsWordsCardMode(false);
    // Force component remount to restart the test
    setRestartKey(prevKey => prevKey + 1);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // localStorage persist focusedMode setting
  const [isFocusedMode, setIsFocusedMode] = useState(
    localStorage.getItem("focused-mode") === "true"
  );

  // musicMode setting
  const [isMusicMode, setIsMusicMode] = useState(false);

  // ultraZenMode setting
  const [isUltraZenMode, setIsUltraZenMode] = useState(
    localStorage.getItem("ultra-zen-mode") === "true"
  );

  // hardcoreMode setting
  const [isHardcoreMode, setIsHardcoreMode] = useLocalPersistState(
    false,
    "hardcore-mode"
  );

  // coffeeMode setting
  const [isCoffeeMode, setIsCoffeeMode] = useState(false);

  // trainer mode setting
  const [isTrainerMode, setIsTrainerMode] = useState(false);

  // words card mode
  const [isWordsCardMode, setIsWordsCardMode] = useLocalPersistState(
    false,
    "IsInWordsCardMode"
  );

  // State to track if user is actively typing (for elegant UI hiding)
  const [isTyping, setIsTyping] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const typingTimeoutRef = useRef(null);

  const isWordGameMode =
    gameMode === GAME_MODE_DEFAULT &&
    !isCoffeeMode &&
    !isTrainerMode &&
    !isWordsCardMode;
  const isSentenceGameMode =
    gameMode === GAME_MODE_SENTENCE &&
    !isCoffeeMode &&
    !isTrainerMode &&
    !isWordsCardMode;

  const handleThemeChange = (e) => {
    window.localStorage.setItem("theme", JSON.stringify(e.value));
    setTheme(e.value);
  };

  const handleSoundTypeChange = (e) => {
    setSoundType(e.label);
  };

  const toggleFocusedMode = () => {
    setIsFocusedMode(!isFocusedMode);
  };

  const toggleSoundMode = () => {
    setSoundMode(!soundMode);
  };

  const toggleMusicMode = () => {
    setIsMusicMode(!isMusicMode);
  };

  const toggleUltraZenMode = () => {
    setIsUltraZenMode(!isUltraZenMode);
  };

  const toggleHardcoreMode = () => {
    setIsHardcoreMode(!isHardcoreMode);
  };

  const toggleCoffeeMode = () => {
    setIsCoffeeMode(!isCoffeeMode);
    setIsTrainerMode(false);
    setIsWordsCardMode(false);
  };

  const toggleTrainerMode = () => {
    setIsTrainerMode(!isTrainerMode);
    setIsCoffeeMode(false);
    setIsWordsCardMode(false);
  };

  const toggleWordsCardMode = () => {
    setIsTrainerMode(false);
    setIsCoffeeMode(false);
    setIsWordsCardMode(!isWordsCardMode);
  };

  // Handle typing activity for elegant UI hiding
  const handleTypingActivity = () => {
    setIsTyping(true);
    setShowControls(false);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to detect when typing stops (1.5 seconds of inactivity)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    if (!isTyping) {
      setShowControls(true);
    }
  };

  // Handle test completion to show controls
  const handleTestComplete = () => {
    setIsTyping(false);
    setShowControls(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Reset controls visibility on test reset
  const handleTestReset = () => {
    setIsTyping(false);
    setShowControls(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    localStorage.setItem("focused-mode", isFocusedMode);
  }, [isFocusedMode]);

  useEffect(() => {
    localStorage.setItem("ultra-zen-mode", isUltraZenMode);
  }, [isUltraZenMode]);

  const textInputRef = useRef(null);
  const focusTextInput = () => {
    textInputRef.current && textInputRef.current.focus();
  };

  const textAreaRef = useRef(null);
  const focusTextArea = () => {
    textAreaRef.current && textAreaRef.current.focus();
  };

  const sentenceInputRef = useRef(null);
  const focusSentenceInput = () => {
    sentenceInputRef.current && sentenceInputRef.current.focus();
  };

  useEffect(() => {
    if (isWordGameMode) {
      focusTextInput();
      return;
    }
    if (isSentenceGameMode) {
      focusSentenceInput();
      return;
    }
    if (isCoffeeMode) {
      focusTextArea();
      return;
    }
    return;
  }, [
    theme,
    isFocusedMode,
    isMusicMode,
    isCoffeeMode,
    isWordGameMode,
    isSentenceGameMode,
    soundMode,
    soundType,
  ]);

  return (
    <ThemeProvider theme={theme}>
      <>
        <DynamicBackground theme={theme}></DynamicBackground>
        <div className="canvas" onMouseMove={handleMouseMove}>
          <GlobalStyles />
          <Logo 
            isFocusedMode={isFocusedMode} 
            isMusicMode={isMusicMode}
            handleNavigateHome={handleNavigateHome}
            showControls={showControls}
          ></Logo>
          {isWordGameMode && (
            <TypeBox
              isUltraZenMode={isUltraZenMode}
              isHardcoreMode={isHardcoreMode}
              textInputRef={textInputRef}
              isFocusedMode={isFocusedMode}
              soundMode={soundMode}
              theme={theme}
              soundType={soundType}
              key={`type-box-${restartKey}`}
              handleInputFocus={() => focusTextInput()}
              onTypingActivity={handleTypingActivity}
              onTestComplete={handleTestComplete}
              onTestReset={handleTestReset}
              showControls={showControls}
            ></TypeBox>
          )}
          {isSentenceGameMode && (
            <SentenceBox
              sentenceInputRef={sentenceInputRef}
              isFocusedMode={isFocusedMode}
              soundMode={soundMode}
              soundType={soundType}
              key={`sentence-box-${restartKey}`}
              handleInputFocus={() => focusSentenceInput()}
              onTypingActivity={handleTypingActivity}
              onTestComplete={handleTestComplete}
              onTestReset={handleTestReset}
              showControls={showControls}
            ></SentenceBox>
          )}
          {isCoffeeMode && !isTrainerMode && !isWordsCardMode && (
            <FreeTypingBox
              textAreaRef={textAreaRef}
              soundMode={soundMode}
              soundType={soundType}
            />
          )}
          {isTrainerMode && !isCoffeeMode && !isWordsCardMode && (
            <DefaultKeyboard
              soundMode={soundMode}
              soundType={soundType}
            ></DefaultKeyboard>
          )}
          {isWordsCardMode && !isCoffeeMode && !isTrainerMode && (
            <WordsCard soundMode={soundMode} soundType={soundType}></WordsCard>
          )}
          <div className="bottomBar">
            <FooterMenu
              isWordGameMode={isWordGameMode}
              themesOptions={themesOptions}
              theme={theme}
              soundMode={soundMode}
              toggleSoundMode={toggleSoundMode}
              soundOptions={soundOptions}
              soundType={soundType}
              toggleUltraZenMode={toggleUltraZenMode}
              toggleHardcoreMode={toggleHardcoreMode}
              isHardcoreMode={isHardcoreMode}
              handleSoundTypeChange={handleSoundTypeChange}
              handleThemeChange={handleThemeChange}
              toggleFocusedMode={toggleFocusedMode}
              toggleMusicMode={toggleMusicMode}
              toggleCoffeeMode={toggleCoffeeMode}
              isCoffeeMode={isCoffeeMode}
              isMusicMode={isMusicMode}
              isUltraZenMode={isUltraZenMode}
              isFocusedMode={isFocusedMode}
              gameMode={gameMode}
              handleGameModeChange={handleGameModeChange}
              isTrainerMode={isTrainerMode}
              toggleTrainerMode={toggleTrainerMode}
              isWordsCardMode={isWordsCardMode}
              toggleWordsCardMode={toggleWordsCardMode}
              showControls={showControls}
            ></FooterMenu>
          </div>
          <MusicPlayerSnackbar
            isMusicMode={isMusicMode}
            isFocusedMode={isFocusedMode}
            onMouseLeave={() => focusTextInput()}
          ></MusicPlayerSnackbar>
        </div>
      </>
    </ThemeProvider>
  );
}

export default App;
