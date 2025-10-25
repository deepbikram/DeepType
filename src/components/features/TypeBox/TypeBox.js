import React, { useEffect, useState, useMemo, useRef } from "react";
import useSound from "use-sound";
import {
  wordsGenerator,
} from "../../../scripts/wordsGenerator";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import IconButton from "../../utils/IconButton";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import useLocalPersistState from "../../../hooks/useLocalPersistState";
import CapsLockSnackbar from "../CapsLockSnackbar";
import Stats from "./Stats";
import { Dialog } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import {
  DEFAULT_COUNT_DOWN,
  COUNT_DOWN_90,
  COUNT_DOWN_60,
  COUNT_DOWN_30,
  COUNT_DOWN_15,
  DEFAULT_WORDS_COUNT,
  WORDS_COUNT_10,
  WORDS_COUNT_25,
  WORDS_COUNT_50,
  WORDS_COUNT_100,
  DEFAULT_DIFFICULTY,
  HARD_DIFFICULTY,
  NUMBER_ADDON,
  SYMBOL_ADDON,
  DEFAULT_DIFFICULTY_TOOLTIP_TITLE,
  HARD_DIFFICULTY_TOOLTIP_TITLE,
  NUMBER_ADDON_TOOLTIP_TITLE,
  SYMBOL_ADDON_TOOLTIP_TITLE,
  ENGLISH_MODE,
  RESTART_BUTTON_TOOLTIP_TITLE,
  REDO_BUTTON_TOOLTIP_TITLE,
  PACING_CARET,
  NUMBER_ADDON_KEY,
  SYMBOL_ADDON_KEY,
} from "../../../constants/Constants";
import { SOUND_MAP } from "../sound/sound";
import EnglishModeWords from "../../common/EnglishModeWords";

const TypeBox = ({
  textInputRef,
  isFocusedMode,
  isUltraZenMode,
  soundMode,
  soundType,
  handleInputFocus,
  theme,
}) => {
  const [play] = useSound(SOUND_MAP[soundType], { volume: 0.5 });
  const [incorrectCharsCount, setIncorrectCharsCount] = useState(0);

  // local persist timer
  const [countDownConstant, setCountDownConstant] = useLocalPersistState(
    DEFAULT_COUNT_DOWN,
    "timer-constant"
  );

  // local persist pacing style - set to PACING_CARET by default
  const [pacingStyle] = useState(PACING_CARET);

  // mode selection: "time" or "word"
  const [mode, setMode] = useLocalPersistState("time", "typing-mode");

  // local persist difficulty
  const [difficulty, setDifficulty] = useLocalPersistState(
    DEFAULT_DIFFICULTY,
    "difficulty"
  );

  // local persist difficulty
  const [language, setLanguage] = useLocalPersistState(
    ENGLISH_MODE,
    "language"
  );

  // local persist words add on for number
  const [numberAddOn, setNumberAddOn] = useLocalPersistState(
    false,
    NUMBER_ADDON_KEY
  );

  // local persist words add on for symbol
  const [symbolAddOn, setSymbolAddOn] = useLocalPersistState(
    false,
    SYMBOL_ADDON_KEY
  );

  // Caps Lock
  const [capsLocked, setCapsLocked] = useState(false);

  // tab-enter restart dialog
  const [openRestart, setOpenRestart] = useState(false);

  // Sync countDownConstant with mode defaults on initial load
  useEffect(() => {
    const storedValue = localStorage.getItem("timer-constant");
    if (!storedValue) {
      // No stored value, set defaults based on mode
      if (mode === "time") {
        setCountDownConstant(COUNT_DOWN_30);
      } else {
        setCountDownConstant(WORDS_COUNT_25);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const EnterkeyPressReset = (e) => {
    // press enter/or tab to reset;
    if (e.keyCode === 13 || e.keyCode === 9) {
      e.preventDefault();
      setOpenRestart(false);
      reset(
        countDownConstant,
        difficulty,
        language,
        numberAddOn,
        symbolAddOn,
        false
      );
    } // press space to redo
    else if (e.keyCode === 32) {
      e.preventDefault();
      setOpenRestart(false);
      reset(
        countDownConstant,
        difficulty,
        language,
        numberAddOn,
        symbolAddOn,
        true
      );
    } else {
      e.preventDefault();
      setOpenRestart(false);
    }
  };
  const handleTabKeyOpen = () => {
    setOpenRestart(true);
  };

  // set up words state
  const [wordsDict, setWordsDict] = useState(() => {
    // If countDownConstant is a word count (<=100), use it; otherwise use default
    const initialWordCount = (countDownConstant <= 100) ? countDownConstant : DEFAULT_WORDS_COUNT;
    return wordsGenerator(
      initialWordCount,
      difficulty,
      ENGLISH_MODE,
      numberAddOn,
      symbolAddOn
    );
  });

  const words = useMemo(() => {
    const allWords = wordsDict.map((e) => e.val);
    // In word mode, limit to exact word count
    if (mode === "word") {
      return allWords.slice(0, countDownConstant);
    }
    return allWords;
  }, [wordsDict, countDownConstant, mode]);

  const wordSpanRefs = useMemo(
    () =>
      Array(words.length)
        .fill(0)
        .map((i) => React.createRef()),
    [words]
  );

  // set up timer state
  // In word mode, countDown tracks elapsed time (starts at 0, counts up)
  // In time mode, countDown tracks remaining time (starts at constant, counts down)
  const [countDown, setCountDown] = useState(() => 
    mode === "word" ? 0 : countDownConstant
  );
  const [intervalId, setIntervalId] = useState(null);

  // set up game loop status state
  const [status, setStatus] = useState("waiting");

  // enable menu
  const menuEnabled = !isFocusedMode || status === "finished";

  // set up hidden input input val state
  const [currInput, setCurrInput] = useState("");
  // set up world advancing index
  const [currWordIndex, setCurrWordIndex] = useState(0);
  // set up char advancing index
  const [currCharIndex, setCurrCharIndex] = useState(-1);
  const [prevInput, setPrevInput] = useState("");

  // set up words examine history
  const [wordsCorrect, setWordsCorrect] = useState(new Set());
  const [wordsInCorrect, setWordsInCorrect] = useState(new Set());
  const [inputWordsHistory, setInputWordsHistory] = useState({});

  // setup stats
  const [rawKeyStrokes, setRawKeyStrokes] = useState(0);
  const [wpmKeyStrokes, setWpmKeyStrokes] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [statsCharCount, setStatsCharCount] = useState([]);

  // set up char examine hisotry
  const [history, setHistory] = useState({});
  const keyString = currWordIndex + "." + currCharIndex;
  const [currChar, setCurrChar] = useState("");

  useEffect(() => {
    if (currWordIndex === DEFAULT_WORDS_COUNT - 1) {
      const generatedEng = wordsGenerator(
        DEFAULT_WORDS_COUNT,
        difficulty,
        ENGLISH_MODE,
        numberAddOn,
        symbolAddOn
      );
      setWordsDict((currentArray) => [...currentArray, ...generatedEng]);
    }
    if (wordSpanRefs[currWordIndex]) {
      const scrollElement = wordSpanRefs[currWordIndex].current;
      if (scrollElement) {
        scrollElement.scrollIntoView({
          block: "center",
        });
      }
    } else {
      return;
    }
  }, [
    currWordIndex,
    wordSpanRefs,
    difficulty,
    language,
    numberAddOn,
    symbolAddOn,
  ]);

  const reset = (
    newCountDown,
    difficulty,
    language,
    newNumberAddOn,
    newSymbolAddOn,
    isRedo
  ) => {
    setStatus("waiting");
    if (!isRedo) {
      // Determine word count based on the current mode
      // In word mode, use newCountDown as the word count
      // In time mode, use default word count
      let wordCount = DEFAULT_WORDS_COUNT;
      if (mode === "word") {
        wordCount = newCountDown;
      }
      
      setWordsDict(
        wordsGenerator(
          wordCount,
          difficulty,
          language,
          newNumberAddOn,
          newSymbolAddOn
        )
      );
    }
    setNumberAddOn(newNumberAddOn);
    setSymbolAddOn(newSymbolAddOn);
    setCountDownConstant(newCountDown);
    // In word mode, start countdown at 0 (counting up elapsed time)
    // In time mode, start at newCountDown (counting down)
    setCountDown(mode === "word" ? 0 : newCountDown);
    setDifficulty(difficulty);
    setLanguage(language);
    clearInterval(intervalId);
    setWpm(0);
    setRawKeyStrokes(0);
    setWpmKeyStrokes(0);
    setCurrInput("");
    setPrevInput("");
    setIntervalId(null);
    setCurrWordIndex(0);
    setCurrCharIndex(-1);
    setCurrChar("");
    setHistory({});
    setInputWordsHistory({});
    setWordsCorrect(new Set());
    setWordsInCorrect(new Set());
    textInputRef.current.focus();
    // console.log("fully reset waiting for next inputs");
    wordSpanRefs[0].current.scrollIntoView();
  };

  const start = () => {
    if (status === "finished") {
      setCurrInput("");
      setPrevInput("");
      setCurrWordIndex(0);
      setCurrCharIndex(-1);
      setCurrChar("");
      setHistory({});
      setInputWordsHistory({});
      setWordsCorrect(new Set());
      setWordsInCorrect(new Set());
      setStatus("waiting");
      textInputRef.current.focus();
    }

    if (status !== "started") {
      setStatus("started");
      
      let intervalId = setInterval(() => {
        setCountDown((prevCountdown) => {
          // In time mode: count down and end when reaching 0
          if (mode === "time") {
            if (prevCountdown === 0) {
              clearInterval(intervalId);
              // current total extra inputs char count
              const currCharExtraCount = Object.values(history)
                .filter((e) => typeof e === "number")
                .reduce((a, b) => a + b, 0);

              // current correct inputs char count
              const currCharCorrectCount = Object.values(history).filter(
                (e) => e === true
              ).length;

              // current correct inputs char count
              const currCharIncorrectCount = Object.values(history).filter(
                (e) => e === false
              ).length;

              // current missing inputs char count
              const currCharMissingCount = Object.values(history).filter(
                (e) => e === undefined
              ).length;

              // current total advanced char counts
              const currCharAdvancedCount =
                currCharCorrectCount +
                currCharMissingCount +
                currCharIncorrectCount;

              // When total inputs char count is 0,
              // that is to say, both currCharCorrectCount and currCharAdvancedCount are 0,
              // accuracy turns out to be 0 but NaN.
              const accuracy =
                currCharCorrectCount === 0
                  ? 0
                  : (currCharCorrectCount / currCharAdvancedCount) * 100;

              setStatsCharCount([
                accuracy,
                currCharCorrectCount,
                currCharIncorrectCount,
                currCharMissingCount,
                currCharAdvancedCount,
                currCharExtraCount,
              ]);

              checkPrev();
              setStatus("finished");

              return countDownConstant;
            } else {
              return prevCountdown - 1;
            }
          } else {
            // In word mode: count up to track elapsed time
            return prevCountdown + 1;
          }
        });
      }, 1000);
      setIntervalId(intervalId);
    }
  };

  const UpdateInput = (e) => {
    if (status === "finished") {
      return;
    }
    setCurrInput(e.target.value);
    inputWordsHistory[currWordIndex] = e.target.value.trim();
    setInputWordsHistory(inputWordsHistory);

    // Auto-finish in word mode when the last word is completed
    if (mode === "word" && status === "started" && currWordIndex === words.length - 1) {
      const currentWord = words[currWordIndex];
      const trimmedInput = e.target.value.trim();
      
      // Check if the input exactly matches the last word
      if (trimmedInput === currentWord) {
        // Mark the word as correct
        setWordsCorrect((prev) => {
          const newSet = new Set(prev);
          newSet.add(currWordIndex);
          return newSet;
        });
        setWordsInCorrect((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currWordIndex);
          return newSet;
        });
        
        // Finish the test
        if (intervalId) {
          clearInterval(intervalId);
        }
        
        const currCharExtraCount = Object.values(history)
          .filter((e) => typeof e === "number")
          .reduce((a, b) => a + b, 0);

        const currCharCorrectCount = Object.values(history).filter(
          (e) => e === true
        ).length;

        const currCharIncorrectCount = Object.values(history).filter(
          (e) => e === false
        ).length;

        const currCharMissingCount = Object.values(history).filter(
          (e) => e === undefined
        ).length;

        const currCharAdvancedCount =
          currCharCorrectCount +
          currCharMissingCount +
          currCharIncorrectCount;

        const accuracy =
          currCharCorrectCount === 0
            ? 0
            : (currCharCorrectCount / currCharAdvancedCount) * 100;

        setStatsCharCount([
          accuracy,
          currCharCorrectCount,
          currCharIncorrectCount,
          currCharMissingCount,
          currCharAdvancedCount,
          currCharExtraCount,
        ]);

        setStatus("finished");
      }
    }
  };

  const handleKeyUp = (e) => {
    setCapsLocked(e.getModifierState("CapsLock"));
  };

  const wpmWorkerRef = useRef(null);

  useEffect(() => {
    // Initialize worker
    wpmWorkerRef.current = new Worker(
      new URL("../../../worker/calculateWpmWorker.js", import.meta.url)
    );

    return () => {
      // Cleanup worker on component unmount
      if (wpmWorkerRef.current) {
        wpmWorkerRef.current.terminate();
      }
    };
  }, []);

  const calculateWpm = (wpmKeyStrokes, countDownConstant, countDown) => {
    if (wpmKeyStrokes !== 0) {
      if (!wpmWorkerRef.current) return; // Ensure worker is initialized

      wpmWorkerRef.current.postMessage({
        wpmKeyStrokes,
        countDownConstant,
        countDown,
        mode,
      });

      wpmWorkerRef.current.onmessage = (event) => {
        setWpm(event.data);
      };

      wpmWorkerRef.current.onerror = (error) => {
        console.error("Worker error:", error);
      };
    }
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    const keyCode = e.keyCode;
    setCapsLocked(e.getModifierState("CapsLock"));

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

    // keydown count for KPM calculations to all types of operations
    if (status === "started") {
      setRawKeyStrokes(rawKeyStrokes + 1);
      // Count all alphanumeric keys and space for WPM (not just uppercase A-Z)
      if (
        (keyCode >= 65 && keyCode <= 90) || // A-Z
        (keyCode >= 48 && keyCode <= 57) || // 0-9
        keyCode === 32 || // Space
        (keyCode >= 186 && keyCode <= 222) // Symbols like ;, =, ,, -, ., /, etc.
      ) {
        setWpmKeyStrokes(wpmKeyStrokes + 1);
      }
    }

    // disable tab key
    if (keyCode === 9) {
      e.preventDefault();
      handleTabKeyOpen();
      return;
    }

    if (status === "finished") {
      setCurrInput("");
      setPrevInput("");
      return;
    }

    // Update stats when typing unless there is no effective WPM
    if (wpmKeyStrokes !== 0) {
      calculateWpm(wpmKeyStrokes, countDownConstant, countDown);
    }

    // start the game by typing any thing
    if (status !== "started" && status !== "finished") {
      start();
    }

    // space bar
    if (keyCode === 32) {
      const prevCorrectness = checkPrev();
      // advance to next regardless prev correct/not
      if (prevCorrectness === true || prevCorrectness === false) {
        if (
          words[currWordIndex].split("").length > currInput.split("").length
        ) {
          setIncorrectCharsCount((prev) => prev + 1);
        }

        // Check if this is the last word in word mode
        if (mode === "word" && currWordIndex + 1 >= words.length) {
          // Finish the test
          setCurrInput("");
          clearInterval(intervalId);
          
          const currCharExtraCount = Object.values(history)
            .filter((e) => typeof e === "number")
            .reduce((a, b) => a + b, 0);

          const currCharCorrectCount = Object.values(history).filter(
            (e) => e === true
          ).length;

          const currCharIncorrectCount = Object.values(history).filter(
            (e) => e === false
          ).length;

          const currCharMissingCount = Object.values(history).filter(
            (e) => e === undefined
          ).length;

          const currCharAdvancedCount =
            currCharCorrectCount +
            currCharMissingCount +
            currCharIncorrectCount;

          const accuracy =
            currCharCorrectCount === 0
              ? 0
              : (currCharCorrectCount / currCharAdvancedCount) * 100;

          setStatsCharCount([
            accuracy,
            currCharCorrectCount,
            currCharIncorrectCount,
            currCharMissingCount,
            currCharAdvancedCount,
            currCharExtraCount,
          ]);

          checkPrev();
          setStatus("finished");
          return;
        }

        // reset currInput
        setCurrInput("");
        // advance to next
        setCurrWordIndex(currWordIndex + 1);
        setCurrCharIndex(-1);
        return;
      } else {
        // but don't allow entire word skip
        // console.log("entire word skip not allowed");
        return;
      }

      // backspace
    } else if (keyCode === 8) {
      // delete the mapping match records
      delete history[keyString];

      // avoid over delete
      if (currCharIndex < 0) {
        // only allow delete prev word, rewind to previous
        if (wordsInCorrect.has(currWordIndex - 1)) {
          // console.log("detected prev incorrect, rewinding to previous");
          const prevInputWord = inputWordsHistory[currWordIndex - 1];
          // console.log(prevInputWord + " ")
          setCurrInput(prevInputWord + " ");
          setCurrCharIndex(prevInputWord.length - 1);
          setCurrWordIndex(currWordIndex - 1);
          setPrevInput(prevInputWord);
        }
        return;
      }
      setCurrCharIndex(currCharIndex - 1);
      setCurrChar("");
      return;
    } else {
      setCurrCharIndex(currCharIndex + 1);
      setCurrChar(key);
      return;
      // if (keyCode >= 65 && keyCode <= 90) {
      //   setCurrCharIndex(currCharIndex + 1);
      //   setCurrChar(key);
      // } else {
      //   return;
      // }
    }
  };

  const getExtraCharClassName = (i, idx, extra) => {
    if (
      pacingStyle === PACING_CARET &&
      currWordIndex === i &&
      idx === extra.length - 1
    ) {
      return "caret-extra-char-right-error";
    }
    return "error-char";
  };

  const getExtraCharsDisplay = (word, i) => {
    let input = inputWordsHistory[i];
    if (!input) {
      input = currInput.trim();
    }
    if (i > currWordIndex) {
      return null;
    }
    if (input.length <= word.length) {
      return null;
    } else {
      const extra = input.slice(word.length, input.length).split("");
      history[i] = extra.length;
      return extra.map((c, idx) => (
        <span key={idx} className={getExtraCharClassName(i, idx, extra)}>
          {c}
        </span>
      ));
    }
  };

  const checkPrev = () => {
    const wordToCompare = words[currWordIndex];
    const currInputWithoutSpaces = currInput.trim();
    const isCorrect = wordToCompare === currInputWithoutSpaces;
    if (!currInputWithoutSpaces || currInputWithoutSpaces.length === 0) {
      return null;
    }
    if (isCorrect) {
      // console.log("detected match");
      wordsCorrect.add(currWordIndex);
      wordsInCorrect.delete(currWordIndex);
      let inputWordsHistoryUpdate = { ...inputWordsHistory };
      inputWordsHistoryUpdate[currWordIndex] = currInputWithoutSpaces;
      setInputWordsHistory(inputWordsHistoryUpdate);
      // reset prevInput to empty (will not go back)
      setPrevInput("");

      // Space was already counted in handleKeyDown, no need to count again
      return true;
    } else {
      // console.log("detected unmatch");
      wordsInCorrect.add(currWordIndex);
      wordsCorrect.delete(currWordIndex);
      let inputWordsHistoryUpdate = { ...inputWordsHistory };
      inputWordsHistoryUpdate[currWordIndex] = currInputWithoutSpaces;
      setInputWordsHistory(inputWordsHistoryUpdate);
      // append currInput to prevInput
      setPrevInput(prevInput + " " + currInputWithoutSpaces);
      return false;
    }
  };

  const getWordClassName = (wordIdx) => {
    if (wordsInCorrect.has(wordIdx)) {
      if (currWordIndex === wordIdx) {
        return "word error-word active-word-no-pulse";
      }
      return "word error-word";
    } else {
      if (currWordIndex === wordIdx) {
        return "word active-word-no-pulse";
      }
      return "word";
    }
  };

  const charsWorkerRef = useRef();

  useEffect(() => {
    charsWorkerRef.current = new Worker(
      new URL("../../../worker/trackCharsErrorsWorker.js", import.meta.url)
    );

    charsWorkerRef.current.onmessage = (e) => {
      if (e.data.type === "increment") {
        setIncorrectCharsCount((prev) => prev + 1);
      }
    };

    return () => {
      charsWorkerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    if (status !== "started") return;

    const word = words[currWordIndex];

    charsWorkerRef.current.postMessage({
      word,
      currChar,
      currCharIndex,
    });
  }, [currChar, status, currCharIndex, words, currWordIndex]);

  const getCharClassName = (wordIdx, charIdx, char, word) => {
    const keyString = wordIdx + "." + charIdx;
    if (
      pacingStyle === PACING_CARET &&
      wordIdx === currWordIndex &&
      charIdx === currCharIndex + 1 &&
      status !== "finished"
    ) {
      return "caret-char-left";
    }
    if (history[keyString] === true) {
      if (
        pacingStyle === PACING_CARET &&
        wordIdx === currWordIndex &&
        word.length - 1 === currCharIndex &&
        charIdx === currCharIndex &&
        status !== "finished"
      ) {
        return "caret-char-right-correct";
      }
      return "correct-char";
    }
    if (history[keyString] === false) {
      if (
        pacingStyle === PACING_CARET &&
        wordIdx === currWordIndex &&
        word.length - 1 === currCharIndex &&
        charIdx === currCharIndex &&
        status !== "finished"
      ) {
        return "caret-char-right-error";
      }

      return "error-char";
    }
    if (
      wordIdx === currWordIndex &&
      charIdx === currCharIndex &&
      currChar &&
      status !== "finished"
    ) {
      if (char === currChar) {
        history[keyString] = true;
        return "correct-char";
      } else {
        history[keyString] = false;
        return "error-char";
      }
    } else {
      if (wordIdx < currWordIndex) {
        // missing chars
        history[keyString] = undefined;
      }

      return "char";
    }
  };

  const getDifficultyButtonClassName = (buttonDifficulty) => {
    if (difficulty === buttonDifficulty) {
      return "active-button";
    }
    return "inactive-button";
  };

  const getAddOnButtonClassName = (addon) => {
    if (addon) {
      return "active-button";
    }
    return "inactive-button";
  };

  const getTimerButtonClassName = (buttonTimerCountDown) => {
    if (countDownConstant === buttonTimerCountDown) {
      return "active-button";
    }
    return "inactive-button";
  };

  const renderResetButton = () => {
    return (
      <div className="restart-button" key="restart-button">
        <Grid container justifyContent="center" alignItems="center" direction="column" spacing={2}>
          <Grid item>
            <Box display="flex" flexDirection="row" gap={1}>
              <IconButton
                aria-label="redo"
                color="secondary"
                size="medium"
                onClick={() => {
                  reset(
                    countDownConstant,
                    difficulty,
                    language,
                    numberAddOn,
                    symbolAddOn,
                    true
                  );
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
                  reset(
                    countDownConstant,
                    difficulty,
                    language,
                    numberAddOn,
                    symbolAddOn,
                    false
                  );
                }}
              >
                <Tooltip title={RESTART_BUTTON_TOOLTIP_TITLE}>
                  <RestartAltIcon />
                </Tooltip>
              </IconButton>
            </Box>
          </Grid>
          {menuEnabled && (
            <Grid item>
              <div className="controls-container">
                <Box display="flex" flexDirection="row" gap={0.5} alignItems="center" flexWrap="wrap" justifyContent="center">
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setMode("time");
                      reset(
                        COUNT_DOWN_30,
                        difficulty,
                        language,
                        numberAddOn,
                        symbolAddOn,
                        false
                      );
                    }}
                  >
                    <span className={mode === "time" ? "active-button" : "inactive-button"}>time</span>
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setMode("word");
                      reset(
                        WORDS_COUNT_25,
                        difficulty,
                        language,
                        numberAddOn,
                        symbolAddOn,
                        false
                      );
                    }}
                  >
                    <span className={mode === "word" ? "active-button" : "inactive-button"}>word</span>
                  </IconButton>
                  <IconButton size="small">
                    <span className="menu-separator"> | </span>
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      reset(
                        countDownConstant,
                        DEFAULT_DIFFICULTY,
                        language,
                        numberAddOn,
                        symbolAddOn,
                        false
                      );
                    }}
                  >
                    <Tooltip
                      title={DEFAULT_DIFFICULTY_TOOLTIP_TITLE}
                    >
                      <span
                        className={getDifficultyButtonClassName(DEFAULT_DIFFICULTY)}
                      >
                        {DEFAULT_DIFFICULTY}
                      </span>
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      reset(
                        countDownConstant,
                        HARD_DIFFICULTY,
                        language,
                        numberAddOn,
                        symbolAddOn,
                        false
                      );
                    }}
                  >
                    <Tooltip
                      title={HARD_DIFFICULTY_TOOLTIP_TITLE}
                    >
                      <span
                        className={getDifficultyButtonClassName(HARD_DIFFICULTY)}
                      >
                        {HARD_DIFFICULTY}
                      </span>
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      reset(
                        countDownConstant,
                        difficulty,
                        language,
                        !numberAddOn,
                        symbolAddOn,
                        false
                      );
                    }}
                  >
                    <Tooltip title={NUMBER_ADDON_TOOLTIP_TITLE}>
                      <span className={getAddOnButtonClassName(numberAddOn)}>
                        {NUMBER_ADDON}
                      </span>
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      reset(
                        countDownConstant,
                        difficulty,
                        language,
                        numberAddOn,
                        !symbolAddOn,
                        false
                      );
                    }}
                  >
                    <Tooltip title={SYMBOL_ADDON_TOOLTIP_TITLE}>
                      <span className={getAddOnButtonClassName(symbolAddOn)}>
                        {SYMBOL_ADDON}
                      </span>
                    </Tooltip>
                  </IconButton>
                  <IconButton size="small">
                    <span className="menu-separator"> | </span>
                  </IconButton>
                  {mode === "time" ? (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => {
                          reset(
                            COUNT_DOWN_90,
                            difficulty,
                            language,
                            numberAddOn,
                            symbolAddOn,
                            false
                          );
                        }}
                      >
                        <span className={getTimerButtonClassName(COUNT_DOWN_90)}>
                          {COUNT_DOWN_90}
                        </span>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          reset(
                            COUNT_DOWN_60,
                            difficulty,
                            language,
                            numberAddOn,
                            symbolAddOn,
                            false
                          );
                        }}
                      >
                        <span className={getTimerButtonClassName(COUNT_DOWN_60)}>
                          {COUNT_DOWN_60}
                        </span>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          reset(
                            COUNT_DOWN_30,
                            difficulty,
                            language,
                            numberAddOn,
                            symbolAddOn,
                            false
                          );
                        }}
                      >
                        <span className={getTimerButtonClassName(COUNT_DOWN_30)}>
                          {COUNT_DOWN_30}
                        </span>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          reset(
                            COUNT_DOWN_15,
                            difficulty,
                            language,
                            numberAddOn,
                            symbolAddOn,
                            false
                          );
                        }}
                      >
                        <span className={getTimerButtonClassName(COUNT_DOWN_15)}>
                          {COUNT_DOWN_15}
                        </span>
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => {
                          reset(
                            WORDS_COUNT_10,
                            difficulty,
                            language,
                            numberAddOn,
                            symbolAddOn,
                            false
                          );
                        }}
                      >
                        <span className={getTimerButtonClassName(WORDS_COUNT_10)}>
                          {WORDS_COUNT_10}
                        </span>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          reset(
                            WORDS_COUNT_25,
                            difficulty,
                            language,
                            numberAddOn,
                            symbolAddOn,
                            false
                          );
                        }}
                      >
                        <span className={getTimerButtonClassName(WORDS_COUNT_25)}>
                          {WORDS_COUNT_25}
                        </span>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          reset(
                            WORDS_COUNT_50,
                            difficulty,
                            language,
                            numberAddOn,
                            symbolAddOn,
                            false
                          );
                        }}
                      >
                        <span className={getTimerButtonClassName(WORDS_COUNT_50)}>
                          {WORDS_COUNT_50}
                        </span>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          reset(
                            WORDS_COUNT_100,
                            difficulty,
                            language,
                            numberAddOn,
                            symbolAddOn,
                            false
                          );
                        }}
                      >
                        <span className={getTimerButtonClassName(WORDS_COUNT_100)}>
                          {WORDS_COUNT_100}
                        </span>
                      </IconButton>
                    </>
                  )}
                </Box>
              </div>
            </Grid>
          )}
        </Grid>
      </div>
    );
  };

  const baseChunkSize = 120;
  const [startIndex, setStartIndex] = useState(0);
  const [visibleWordsCount, setVisibleWordsCount] = useState(baseChunkSize);

  // Reset startIndex when status changes
  useEffect(() => {
    setStartIndex(0);
  }, [status]);

  // Adjust visible words based on current word index
  useEffect(() => {
    const endIndex = startIndex + visibleWordsCount;

    // Ensure the current word is within the visible area
    if (currWordIndex >= endIndex - 5) {
      const newStartIndex = Math.max(
        0,
        Math.min(
          currWordIndex - Math.floor(visibleWordsCount / 2),
          words.length - visibleWordsCount
        )
      );

      if (newStartIndex !== startIndex) {
        setStartIndex(newStartIndex);
        setVisibleWordsCount(
          Math.min(words.length - newStartIndex, baseChunkSize)
        );
      }
    }
  }, [currWordIndex, startIndex, words.length, visibleWordsCount]);

  // Calculate the end index and slice the words
  const endIndex = useMemo(
    () => Math.min(startIndex + visibleWordsCount, words.length),
    [startIndex, visibleWordsCount, words.length]
  );

  const currentWords = useMemo(
    () => words.slice(startIndex, endIndex),
    [startIndex, endIndex, words]
  );

  return (
    <>
      {/* <SocialLinksModal status={status} /> */}
      <div onClick={handleInputFocus}>
        <CapsLockSnackbar open={capsLocked}></CapsLockSnackbar>
        <EnglishModeWords
          currentWords={currentWords}
          currWordIndex={currWordIndex}
          isUltraZenMode={isUltraZenMode}
          startIndex={startIndex}
          status={status}
          wordSpanRefs={wordSpanRefs}
          getWordClassName={getWordClassName}
          getCharClassName={getCharClassName}
          getExtraCharsDisplay={getExtraCharsDisplay}
        />
        <div className="stats">
          <Stats
            status={status}
            language={language}
            wpm={wpm}
            setIncorrectCharsCount={setIncorrectCharsCount}
            incorrectCharsCount={incorrectCharsCount}
            theme={theme}
            countDown={countDown}
            countDownConstant={countDownConstant}
            statsCharCount={statsCharCount}
            rawKeyStrokes={rawKeyStrokes}
            wpmKeyStrokes={wpmKeyStrokes}
            renderResetButton={renderResetButton}
            mode={mode}
            currWordIndex={currWordIndex}
            totalWords={words.length}
          ></Stats>
          {status !== "finished" && renderResetButton()}
        </div>
        <input
          key="hidden-input"
          ref={textInputRef}
          type="text"
          className="hidden-input"
          onKeyDown={(e) => handleKeyDown(e)}
          onKeyUp={(e) => handleKeyUp(e)}
          value={currInput}
          onChange={(e) => UpdateInput(e)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
        />
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
    </>
  );
};

export default TypeBox;
