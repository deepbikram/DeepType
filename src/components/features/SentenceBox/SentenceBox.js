import React from "react";
import { useState, useMemo, useEffect } from "react";
import { sentencesGenerator } from "../../../scripts/sentencesGenerator";
import { Stack } from "@mui/material";
import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import IconButton from "../../utils/IconButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import {
  DEFAULT_SENTENCES_COUNT,
  TEN_SENTENCES_COUNT,
  FIFTEEN_SENTENCES_COUNT,
  RESTART_BUTTON_TOOLTIP_TITLE,
  REDO_BUTTON_TOOLTIP_TITLE,
} from "../../../constants/Constants";
import useLocalPersistState from "../../../hooks/useLocalPersistState";
import {
  ENGLISH_MODE,
  ENGLISH_SENTENCE_MODE_TOOLTIP_TITLE,
} from "../../../constants/Constants";
import { Tooltip } from "@mui/material";
import { Dialog } from "@mui/material";
import { DialogTitle } from "@mui/material";
import SentenceBoxStats from "./SentenceBoxStats";
import { SOUND_MAP } from "../sound/sound";
import useSound from "use-sound";

const SentenceBox = ({
  sentenceInputRef,
  handleInputFocus,
  isFocusedMode,
  soundMode,
  soundType,
  onTypingActivity,
  onTestComplete,
  onTestReset,
  showControls,
}) => {
  const [play] = useSound(SOUND_MAP[soundType], { volume: 0.5 });

  // local persist timer
  const [sentencesCountConstant, setSentencesCountConstant] =
    useLocalPersistState(DEFAULT_SENTENCES_COUNT, "sentences-constant");

  // local persist difficulty
  const [language, setLanguage] = useLocalPersistState(
    ENGLISH_MODE,
    "sentences-language"
  );

  // tab-enter restart dialog
  const [openRestart, setOpenRestart] = useState(false);
  const EnterkeyPressReset = (e) => {
    // press enter/or tab to reset;
    if (e.keyCode === 13 || e.keyCode === 9) {
      e.preventDefault();
      setOpenRestart(false);
      reset(sentencesCountConstant, language, false);
    } else if (e.keyCode === 32) {
      e.preventDefault();
      setOpenRestart(false);
      reset(sentencesCountConstant, language, true);
    } else {
      e.preventDefault();
      setOpenRestart(false);
    }
  };

  const handleTabKeyOpen = () => {
    setOpenRestart(true);
  };

  const getSentencesCountButtonClassName = (buttonSentencesCountConstant) => {
    if (buttonSentencesCountConstant === sentencesCountConstant) {
      return "active-button";
    }
    return "inactive-button";
  };

  const getLanguageButtonClassName = (buttonLanguage) => {
    if (language === buttonLanguage) {
      return "active-button";
    }
    return "inactive-button";
  };

  // set up game loop status state
  const [status, setStatus] = useState("waiting");

  // Track if input is focused
  const [isFocused, setIsFocused] = useState(false);

  // Handle "press any key to focus" when input is not focused
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // If input is not focused and status is not finished, focus the input
      if (!isFocused && status !== "finished" && sentenceInputRef.current) {
        // Ignore modifier keys only
        if (
          e.keyCode === 20 || // CapsLock
          e.keyCode === 16 || // Shift
          e.keyCode === 17 || // Ctrl
          e.keyCode === 18 || // Alt
          e.keyCode === 91 || // Left Command/Meta (macOS)
          e.keyCode === 93 || // Right Command/Meta (macOS)
          e.keyCode === 224    // Meta (Firefox)
        ) {
          return;
        }
        sentenceInputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isFocused, status, sentenceInputRef]);

  // set up stop watch in seconds
  const [time, setTime] = useState(0);

  // set up stop watch running status
  const [timeRunning, setTimeRunning] = useState(false);

  // stop watch loop
  useEffect(() => {
    let interval;
    if (timeRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!timeRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timeRunning]);

  // set up sentences
  const [sentencesDict, setSentencesDict] = useState(() => {
    return sentencesGenerator(sentencesCountConstant, language);
  });
  // enable menu
  const menuEnabled = !isFocusedMode || status === "finished";

  const sentences = useMemo(() => {
    return sentencesDict.map((e) => e.val);
  }, [sentencesDict]);

  // set up currSentenceIndex
  const [currSentenceIndex, setCurrSentenceIndex] = useState(0);

  const currSentence = sentences[currSentenceIndex];

  // set up curr input
  const [currInput, setCurrInput] = useState("");

  // set up stats kpm
  const [rawKeyStroke, setRawKeyStroke] = useState(0);

  const wpm = time < 1 ? 0 : ((rawKeyStroke / time) * 60) / 5;

  const reset = (newSentencesCountConstant, newLanguage, isRedo) => {
    setStatus("waiting");
    setSentencesCountConstant(newSentencesCountConstant);
    setLanguage(newLanguage);
    if (!isRedo) {
      setSentencesDict(
        sentencesGenerator(newSentencesCountConstant, newLanguage)
      );
    }
    setTimeRunning(false);
    setTime(0);
    setCurrSentenceIndex(0);
    setCurrInput("");
    sentenceInputRef.current.focus();
    sentenceInputRef.current.value = "";
    setRawKeyStroke(0);
    setStats({
      correct: 0,
      incorrect: 0,
      extra: 0,
    });
    
    // Notify parent that test was reset
    if (onTestReset) {
      onTestReset();
    }
  };

  const start = () => {
    if (status === "finished") {
      reset(sentencesCountConstant, language, false);
    }
    if (status !== "started") {
      setStatus("started");
      setTimeRunning(true);
    }
  };

  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    extra: 0,
  });

  const checkAndUpdateStats = (currSentence, currInput) => {
    const newStats = stats;
    for (let i = 0; i < currSentence.length; i++) {
      if (currSentence[i] === currInput[i]) {
        newStats.correct++;
      } else {
        newStats.incorrect++;
      }
    }
    const deltaCharDifference = currInput.length - currSentence.length;

    if (deltaCharDifference > 0) {
      newStats.extra = deltaCharDifference;
    }

    setStats(newStats);
  };

  const handleKeyDown = (e) => {
    const keyCode = e.keyCode;
    
    // Notify parent about typing activity
    if (onTypingActivity && status === "started") {
      onTypingActivity();
    }
    
    // Ignore modifier keys (Shift, Ctrl, Alt, Meta/Command, CapsLock, etc.)
    if (
      keyCode === 20 || // CapsLock
      keyCode === 16 || // Shift
      keyCode === 17 || // Ctrl
      keyCode === 18 || // Alt
      keyCode === 91 || // Left Command/Meta (macOS)
      keyCode === 93 || // Right Command/Meta (macOS)
      keyCode === 224 || // Meta (Firefox)
      e.metaKey || // Meta key is pressed
      (e.ctrlKey && keyCode !== 86 && keyCode !== 67) // Ctrl without paste/copy
    ) {
      e.preventDefault();
      return;
    }

    // Play sound only for valid typing keys
    if (status !== "finished" && soundMode) {
      play();
    }

    // disable tab key
    if (keyCode === 9) {
      e.preventDefault();
      handleTabKeyOpen();
      return;
    }
    if (status === "finished") {
      e.preventDefault();
      return;
    }

    // start the game by typing any thing
    if (status !== "started" && status !== "finished") {
      start();
      return;
    }

    setRawKeyStroke(rawKeyStroke + 1);

    // if enter key pressed.
    // advance to next sentence only if the input val length is equal to the current sentence char count);

    if (keyCode === 13) {
      if (currInput.length >= sentences[currSentenceIndex].length) {
        checkAndUpdateStats(currSentence, currInput);
        if (currSentenceIndex + 1 === sentencesCountConstant) {
          setStatus("finished");
          setTimeRunning(false);
          
          // Notify parent that test is complete
          if (onTestComplete) {
            onTestComplete();
          }
          return;
        }
        setCurrSentenceIndex(currSentenceIndex + 1);
        setCurrInput("");
        sentenceInputRef.current.value = "";
        return;
      }
      return;
    }
  };

  const getCharClassName = (idx, char) => {
    if (idx < currInput.length) {
      if (currInput[idx] === char) {
        return "correct-sentence-char";
      }
      if (char === " ") {
        return "error-sentence-space-char";
      }
      return "error-sentence-char";
    }
    return "sentence-char";
  };

  let isOnComposition = false;

  const isChrome = !!window.chrome;

  const handleComposition = (e) => {
    const {
      type,
      currentTarget: { value },
    } = e;
    if (type === "compositionend") {
      // composition finished
      isOnComposition = false;
      if (
        e.currentTarget instanceof HTMLInputElement &&
        !isOnComposition &&
        isChrome
      ) {
        setCurrInput(value);
      }
    } else {
      // composition ongoing
      isOnComposition = true;
    }
  };

  const handleChange = (e) => {
    const {
      currentTarget: { value },
    } = e;
    if (e.currentTarget instanceof HTMLInputElement && !isOnComposition) {
      setCurrInput(value);
    }
  };

  return (
    <div onClick={handleInputFocus} style={{ position: 'relative' }}>
      <div className="type-box-sentence">
        <Stack spacing={2}>
          <div style={{ position: 'relative' }}>
            {!isFocused && status !== "finished" && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.5rem',
                color: '#d1d5db',
                opacity: 0.9,
                pointerEvents: 'none',
                zIndex: 10,
                textAlign: 'center',
                userSelect: 'none',
                transition: 'opacity 0.3s ease-in-out',
                fontWeight: '400',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Click here or press any key to focus
              </div>
            )}
            <div 
              className="sentence-display-field"
              style={{
                filter: (!isFocused && status !== "finished") ? 'blur(5px)' : 'none',
                transition: 'filter 0.3s ease-in-out',
              }}
            >
              {currSentence.split("").map((char, idx) => (
                <span key={"word" + idx} className={getCharClassName(idx, char)}>
                  {char}
                </span>
              ))}
            </div>
          </div>
          <input
            key="hidden-sentence-input"
            ref={sentenceInputRef}
            type="text"
            spellCheck="false"
            className="sentence-input-field"
            onKeyDown={(e) => handleKeyDown(e)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onCompositionStart={handleComposition}
            onCompositionUpdate={handleComposition}
            onCompositionEnd={handleComposition}
            onChange={handleChange}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            data-form-type="other"
          />
          {status !== "finished" && (
            <span className="next-sentence-display">
              {"->"} {sentences[currSentenceIndex + 1] ?? "Press ↵ to finish."}
            </span>
          )}
        </Stack>
      </div>
      <div className="stats">
        <SentenceBoxStats
          countDown={time}
          wpm={wpm}
          status={status}
          stats={stats}
          rawKeyStrokes={rawKeyStroke}
        ></SentenceBoxStats>

        <div className="restart-button" key="restart-button">
          <Grid container justifyContent="center" alignItems="center">
            <Box display="flex" flexDirection="row">
              <IconButton
                aria-label="redo"
                color="secondary"
                size="medium"
                onClick={() => {
                  reset(sentencesCountConstant, language, true);
                }}
              >
                <Tooltip title={REDO_BUTTON_TOOLTIP_TITLE}>
                  <UndoIcon />
                </Tooltip>
              </IconButton>
              <IconButton
                aria-label="restart"
                color="secondary"
                size="medium"
                onClick={() => {
                  reset(sentencesCountConstant, language, false);
                }}
              >
                <Tooltip title={RESTART_BUTTON_TOOLTIP_TITLE}>
                  <RestartAltIcon />
                </Tooltip>
              </IconButton>
              {menuEnabled && (
                <div style={{ 
                  visibility: showControls ? 'visible' : 'hidden',
                  opacity: showControls ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                  display: 'inline-flex',
                }}>
                  <IconButton
                    onClick={() => {
                      reset(DEFAULT_SENTENCES_COUNT, language, false);
                    }}
                  >
                    <span
                      className={getSentencesCountButtonClassName(
                        DEFAULT_SENTENCES_COUNT
                      )}
                    >
                      {DEFAULT_SENTENCES_COUNT}
                    </span>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      reset(TEN_SENTENCES_COUNT, language, false);
                    }}
                  >
                    <span
                      className={getSentencesCountButtonClassName(
                        TEN_SENTENCES_COUNT
                      )}
                    >
                      {TEN_SENTENCES_COUNT}
                    </span>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      reset(FIFTEEN_SENTENCES_COUNT, language, false);
                    }}
                  >
                    <span
                      className={getSentencesCountButtonClassName(
                        FIFTEEN_SENTENCES_COUNT
                      )}
                    >
                      {FIFTEEN_SENTENCES_COUNT}
                    </span>
                  </IconButton>
                  <IconButton>
                    {" "}
                    <span className="menu-separator"> | </span>{" "}
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      reset(sentencesCountConstant, ENGLISH_MODE, false);
                    }}
                  >
                    <Tooltip title={ENGLISH_SENTENCE_MODE_TOOLTIP_TITLE}>
                      <span
                        className={getLanguageButtonClassName(ENGLISH_MODE)}
                      >
                        eng
                      </span>
                    </Tooltip>
                  </IconButton>
                </div>
              )}
            </Box>
          </Grid>
        </div>
      </div>
      <Dialog
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
        open={openRestart}
        onKeyDown={EnterkeyPressReset}
      >
        <DialogTitle>
          <div>
            <span className="key-note"> press </span>
            <span className="key-type">Space</span>{" "}
            <span className="key-note">to redo</span>
          </div>
          <div>
            <span className="key-note"> press </span>
            <span className="key-type">Tab</span>{" "}
            <span className="key-note">/</span>{" "}
            <span className="key-type">Enter</span>{" "}
            <span className="key-note">to restart</span>
          </div>
          <span className="key-note"> press </span>
          <span className="key-type">any key </span>{" "}
          <span className="key-note">to exit</span>
        </DialogTitle>
      </Dialog>
    </div>
  );
};

export default SentenceBox;
