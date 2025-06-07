// App.js

import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card bg-dark text-white p-4 mb-4 text-center rounded">
      <h2>🕒 Digital Clock</h2>
      <h3>{time.toLocaleTimeString()}</h3>
      <p>{time.toLocaleDateString()}</p>
    </div>
  );
}

function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);
  const beepRef = useRef(null);

  useEffect(() => {
    if (running) {
      const startTime = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      if (elapsed > 0) {
        beepRef.current.play();
        setHistory((h) => [...h, elapsed]);
        speakTimeStopped();
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  }

  function resetStopwatch() {
    setRunning(false);
    setElapsed(0);
    setHistory([]);
  }

  // Voice notification when stopped
  function speakTimeStopped() {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("Time stopped");
      window.speechSynthesis.speak(utterance);
    }
  }

  // Stopwatch stats
  const fastest = history.length ? formatTime(Math.min(...history)) : "--:--:--";
  const slowest = history.length ? formatTime(Math.max(...history)) : "--:--:--";
  const average =
    history.length
      ? formatTime(history.reduce((a, b) => a + b, 0) / history.length)
      : "--:--:--";

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      switch (e.key.toLowerCase()) {
        case "s":
          setRunning(true);
          break;
        case "p":
          setRunning(false);
          break;
        case "r":
          resetStopwatch();
          break;
        case "c":
          setHistory([]);
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="card bg-dark text-white p-4 rounded">
      <h2>⏱️ Stopwatch</h2>
      <h3>{formatTime(elapsed)}</h3>

      <div className="d-flex justify-content-center mb-3 flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => setRunning(true)}>
          Start (S)
        </button>
        <button className="btn btn-danger" onClick={() => setRunning(false)}>
          Stop (P)
        </button>
        <button className="btn btn-secondary" onClick={resetStopwatch}>
          Reset (R)
        </button>
        <button className="btn btn-warning" onClick={() => setHistory([])}>
          Clear History (C)
        </button>
      </div>

      <div>
        <h4>History</h4>
        {history.length === 0 && <p>No records yet.</p>}
        <ul className="list-group mb-3">
          {history.map((time, i) => (
            <li
              key={i}
              className="list-group-item bg-dark text-white border-secondary"
            >
              {formatTime(time)}
            </li>
          ))}
        </ul>

        <h5>Stats</h5>
        <ul className="list-group list-group-horizontal gap-3">
          <li className="list-group-item bg-dark text-white border-secondary">
            Fastest: {fastest}
          </li>
          <li className="list-group-item bg-dark text-white border-secondary">
            Slowest: {slowest}
          </li>
          <li className="list-group-item bg-dark text-white border-secondary">
            Average: {average}
          </li>
        </ul>
      </div>

      <audio
  ref={beepRef}
  src={process.env.PUBLIC_URL + "/beep.mp3"}
  preload="auto"
/>

    </div>
  );
}

function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("bg-light", light);
    document.body.classList.toggle("text-dark", light);
    document.body.classList.toggle("bg-dark", !light);
    document.body.classList.toggle("text-white", !light);
  }, [light]);

  return (
    <button
      className={`btn btn-${light ? "dark" : "info"} position-fixed top-0 end-0 m-3`}
      onClick={() => setLight(!light)}
    >
      Toggle Mode
    </button>
  );
}

export default function App() {
  return (
    <div className="container py-5">
      <ThemeToggle />
      <DigitalClock />
      <Stopwatch />
      <footer className="text-center mt-5 text-muted">
        Press S to Start, P to Pause, R to Reset, C to Clear History
      </footer>
    </div>
  );
}
