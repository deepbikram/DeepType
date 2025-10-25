// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
  const { wpmKeyStrokes, countDownConstant, countDown, mode } = e.data;

  // In time mode: countDown decreases, so elapsed = countDownConstant - countDown
  // In word mode: countDown increases, so elapsed = countDown (or at least 1)
  const elapsedTime = mode === "time"
    ? Math.max(countDownConstant - countDown, 1) // Avoid division by zero
    : Math.max(countDown, 1);

  // Standard WPM formula: (characters / 5) / time_in_minutes
  // where characters are the correctly typed characters
  const currWpm = (wpmKeyStrokes / 5) / (elapsedTime / 60.0);

  postMessage(currWpm);
};
