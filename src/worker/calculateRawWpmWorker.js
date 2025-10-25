// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
  const { rawKeyStrokes, countDownConstant, countDown, mode } = e.data;

  // In time mode: countDown decreases, so elapsed = countDownConstant - countDown
  // In word mode: countDown increases, so elapsed = countDown (or at least 1)
  const elapsedTime = mode === "time"
    ? Math.max(countDownConstant - countDown, 1) // Avoid division by zero
    : Math.max(countDown, 1);

  // Raw WPM includes all keystrokes (correct and incorrect)
  const roundedRawWpm = Math.round(
    (rawKeyStrokes / 5) / (elapsedTime / 60.0)
  );

  postMessage(roundedRawWpm);
};
