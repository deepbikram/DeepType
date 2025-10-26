import React, { useEffect, useState } from "react";
import { Tooltip } from "@mui/material";
import { CHAR_TOOLTIP_TITLE } from "../../../constants/Constants";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as TooltipChart,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";
import { red } from "@mui/material/colors";

const Stats = ({
  status,
  wpm,
  countDown,
  countDownConstant,
  statsCharCount,
  language,
  rawKeyStrokes,
  theme,
  renderResetButton,
  setIncorrectCharsCount,
  incorrectCharsCount,
  mode,
  currWordIndex,
  totalWords,
}) => {
  const [roundedRawWpm, setRoundedRawWpm] = useState(0);
  const roundedWpm = Math.round(wpm);

  useEffect(() => {
    const worker = new Worker(
      new URL("../../../worker/calculateRawWpmWorker.js", import.meta.url)
    );

    worker.postMessage({ rawKeyStrokes, countDownConstant, countDown, mode });

    worker.onmessage = function (e) {
      setRoundedRawWpm(e.data);
      worker.terminate();
    };

    return () => worker.terminate();
  }, [rawKeyStrokes, countDownConstant, countDown, mode]);

  const initialTypingTestHistory = [
    {
      wpm: 0,
      rawWpm: 0,
      time: 0,
      error: 0,
    },
  ];

  const [typingTestHistory, setTypingTestHistory] = useState(
    initialTypingTestHistory
  );

  const accuracy = Math.round(statsCharCount[0]);

  const data = typingTestHistory.map((history) => ({
    wpm: history.wpm,
    rawWpm: history.rawWpm,
    time: history.time,
    error: history.error,
  }));

  useEffect(() => {
    if (status === "started") {
      setTypingTestHistory(initialTypingTestHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    // In time mode: track when countDown < countDownConstant (counting down)
    // In word mode: track when countDown > 0 (counting up)
    const shouldTrack = mode === "time" 
      ? (status === "started" && countDown < countDownConstant)
      : (status === "started" && countDown > 0);
    
    if (shouldTrack) {
      const worker = new Worker(
        new URL("../../../worker/trackHistoryWorker.js", import.meta.url)
      );

      worker.postMessage({
        countDown,
        countDownConstant,
        typingTestHistory,
        roundedWpm,
        roundedRawWpm,
        incorrectCharsCount,
        mode,
      });

      worker.onmessage = function (e) {
        const { newEntry, resetErrors } = e.data;
        setTypingTestHistory((prevTypingTestHistory) => [
          ...prevTypingTestHistory,
          newEntry,
        ]);

        if (resetErrors) {
          setIncorrectCharsCount(0);
        }
      };

      // Clean up the worker on component unmount
      return () => worker.terminate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countDown]);

  const getFormattedLanguageLanguageName = (value) => {
    switch (value) {
      case "ENGLISH_MODE":
        return "eng";
      case "CHINESE_MODE":
        return "chn";
      default:
        return "eng";
    }
  };

  const renderCharStats = () => (
    <Tooltip
      title={
        <span style={{ whiteSpace: "pre-line" }}>{CHAR_TOOLTIP_TITLE}</span>
      }
    >
      <div>
        <p className="stats-title">Characters</p>
        <h2 className="stats-value">
          <span className="correct-char-stats">{statsCharCount[1]}</span>/
          <span className="incorrect-char-stats">{statsCharCount[2]}</span>/
          <span className="missing-char-stats">{statsCharCount[3]}</span>/
          <span className="correct-char-stats">{statsCharCount[4]}</span>/
          <span className="incorrect-char-stats">{statsCharCount[5]}</span>
        </h2>
      </div>
    </Tooltip>
  );

  const renderIndicator = (color) => (
    <span
      style={{ backgroundColor: color, height: "12px", width: "24px" }}
    ></span>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const payloadData = payload[0].payload;
      return (
        <div
          className="custom-tooltip"
          style={{
            paddingInline: "8px",
            paddingBlock: "2px",
          }}
        >
          <p className="label" style={{ fontSize: "12px", fontWeight: "bold" }}>
            {`Time: ${label} s`}
          </p>
          <p className="desc tooltip">
            {renderIndicator(red[400])}
            {`Errors: ${payloadData.error}`}
          </p>
          <p className="desc tooltip">
            {renderIndicator(theme.textTypeBox)}
            {`Raw WPM: ${payloadData.rawWpm}`}
          </p>
          <p className="desc tooltip">
            {renderIndicator(theme.text)}
            {`WPM: ${payloadData.wpm}`}
          </p>
        </div>
      );
    }

    return null;
  };

  const renderAccuracy = () => (
    <div style={{ marginTop: "16px" }}>
      <h2 className="primary-stats-title">ACC</h2>
      <h1 className="primary-stats-value">{accuracy}%</h1>
    </div>
  );

  const renderRawKpm = () => {
    // In time mode: use countDownConstant (the test duration)
    // In word mode: use countDown (the elapsed time)
    const timeInSeconds = mode === "time" ? countDownConstant : Math.max(countDown, 1);
    return (
      <div>
        <p className="stats-title">KPM</p>
        <h2 className="stats-value">
          {Math.round((rawKeyStrokes / timeInSeconds) * 60.0)}
        </h2>
      </div>
    );
  };

  const renderLanguage = () => (
    <div>
      <p className="stats-title">Test Mode</p>
      <h2 className="stats-value">
        {getFormattedLanguageLanguageName(language)}
      </h2>
    </div>
  );

  const renderTime = () => (
    <div>
      <p className="stats-title">Time</p>
      <h2 className="stats-value">
        {mode === "time" ? `${countDownConstant} s` : `${countDown} s`}
      </h2>
    </div>
  );

  const renderWpm = () => {
    // Calculate WPM based on final stats instead of averaging samples
    if (status === "finished" && statsCharCount.length > 0) {
      const correctChars = statsCharCount[1]; // correct character count
      // Use the same elapsed time calculation as the worker
      // In time mode: countDownConstant is the test duration
      // In word mode: countDown is the elapsed time
      const timeInSeconds = mode === "time" 
        ? Math.max(countDownConstant, 1) 
        : Math.max(countDown, 1);
      const finalWpm = (correctChars / 5) / (timeInSeconds / 60.0);
      return (
        <div>
          <h2 className="primary-stats-title">WPM</h2>
          <h1 className="primary-stats-value">{Math.round(finalWpm)}</h1>
        </div>
      );
    }
    
    // During test, use average
    const totalWpm = data.map((e) => e.wpm).reduce((a, b) => a + b, 0);
    const averageWpm = data.length > 1 ? totalWpm / (data.length - 1) : 0;
    return (
      <div>
        <h2 className="primary-stats-title">WPM</h2>
        <h1 className="primary-stats-value">{Math.round(averageWpm)}</h1>
      </div>
    );
  };

  const Chart = () => (
    <ResponsiveContainer
      width="100%"
      minHeight={200}
      maxHeight={200}
      height="100%"
    >
      <ComposedChart
        width="100%"
        height="100%"
        data={data.filter((d) => d.time !== 0)}
        margin={{
          top: 12,
          right: 12,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid
          vertical={false}
          horizontal={false}
          stroke={theme.text}
          opacity={0.15}
        />
        <XAxis
          dataKey="time"
          stroke={theme.text}
          tickMargin={10}
          opacity={0.25}
        />
        <YAxis stroke={theme.text} tickMargin={10} opacity={0.25} />
        <TooltipChart cursor content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="rawWpm"
          stroke={theme.textTypeBox}
          dot={false}
          activeDot={false}
        />
        <Line
          type="monotone"
          dataKey="wpm"
          stroke={theme.text}
          dot={false}
          activeDot={false}
        />
        <Bar dataKey="error" barSize={12} fill={`${red[400]}`} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <>
      {status !== "finished" && (
        <>
          {mode === "time" && <h3>{countDown} s</h3>}
          {mode === "word" && <h3>{Math.max(0, countDownConstant - currWordIndex)} words</h3>}
          <h3>WPM: {Math.round(wpm)}</h3>
        </>
      )}

      {status === "finished" && (
        <div className="stats-overlay">
          <section className="stats-chart">
            <section className="stats-header">
              <div>
                {renderWpm()}
                {renderAccuracy()}
              </div>
              {Chart()}
            </section>
            <section className="stats-footer">
              {renderLanguage()}
              {renderRawKpm()}
              {renderCharStats()}
              {renderTime()}
            </section>
            <section>{renderResetButton()}</section>
          </section>
        </div>
      )}
    </>
  );
};

export default Stats;
