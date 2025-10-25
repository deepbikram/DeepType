// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
  const {
    countDown,
    countDownConstant,
    roundedWpm,
    roundedRawWpm,
    incorrectCharsCount,
    mode,
  } = e.data;

  let shouldRecord = false;
  let currentTime = 0;

  // In time mode, countDown decreases; in word mode, countDown increases
  if (mode === "time") {
    // Time mode: calculate elapsed time
    const elapsedTime = countDownConstant - countDown;
    
    switch (countDownConstant) {
      case 90:
      case 60:
      case 30:
        shouldRecord = elapsedTime % 5 === 0 && elapsedTime > 0;
        break;
      case 15:
        shouldRecord = elapsedTime > 0;
        break;
      default:
        shouldRecord = elapsedTime > 0;
    }
    currentTime = elapsedTime;
  } else {
    // Word mode: countDown is the elapsed time (counts up)
    shouldRecord = countDown > 0;
    currentTime = countDown;
  }

  if (shouldRecord) {
    const newEntry = {
      wpm: roundedWpm,
      rawWpm: roundedRawWpm,
      time: currentTime,
      error: incorrectCharsCount,
    };

    postMessage({ newEntry, resetErrors: true });
  }
};
