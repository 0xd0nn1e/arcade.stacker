import React, { useEffect, useState, useRef } from "react";

/**
 * 🎮 Arcade Stacker (Grid version)
 * -------------------------------
 * - 7 columns × 15 rows grid
 * - Each block snaps to grid
 * - Press ENTER to drop
 * - Trim overlap → stack gets narrower
 */

export default function App() {
  return (
    <div style={styles.page}>
      <StackerArcade />
    </div>
  );
}

function StackerArcade() {
  const COLS = 7;
  const ROWS = 15;
  const START_WIDTH = 3;
  const START_ROW = 0;

  const [stack, setStack] = useState([
    { row: START_ROW, cols: Array.from({ length: START_WIDTH }, (_, i) => 2 + i) },
  ]);

  const [moving, setMoving] = useState({
    row: START_ROW + 1,
    cols: Array.from({ length: START_WIDTH }, (_, i) => 2 + i),
    dir: 1,
  });

  const [speed, setSpeed] = useState(400); // ms per move
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const intervalRef = useRef();

  // movement
  useEffect(() => {
    if (!running || gameOver) return;
    intervalRef.current = setInterval(() => {
      setMoving((prev) => {
        const maxCol = Math.max(...prev.cols);
        const minCol = Math.min(...prev.cols);
        let dir = prev.dir;

        if (dir === 1 && maxCol >= COLS - 1) dir = -1;
        if (dir === -1 && minCol <= 0) dir = 1;

        const shifted = prev.cols.map((c) => c + dir);
        return { ...prev, cols: shifted, dir };
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [running, speed, gameOver]);

  // key controls
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") handleDrop();
      if (e.key.toLowerCase() === "r") restart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleDrop = () => {
    if (gameOver) return;

    const prevRow = stack[stack.length - 1];
    const overlap = moving.cols.filter((c) => prevRow.cols.includes(c));

    if (overlap.length === 0) {
      setGameOver(true);
      setRunning(false);
      return;
    }

    const newRow = moving.row;
    const newStack = [...stack, { row: newRow, cols: overlap }];

    if (newRow >= ROWS - 1) {
      setGameOver(true);
      setRunning(false);
      return;
    }

    // Prepare next moving row
    const nextRow = newRow + 1;
    setStack(newStack);
    setMoving({ row: nextRow, cols: overlap, dir: 1 });
    setSpeed((s) => Math.max(100, s - 15)); // faster as you go
  };

  const restart = () => {
    setStack([{ row: 0, cols: Array.from({ length: START_WIDTH }, (_, i) => 2 + i) }]);
    setMoving({ row: 1, cols: Array.from({ length: START_WIDTH }, (_, i) => 2 + i), dir: 1 });
    setSpeed(400);
    setRunning(true);
    setGameOver(false);
  };

  return (
    <div style={styles.cabinet}>
      <div style={styles.majorPrize}>MAJOR PRIZE</div>
      <div style={styles.grid}>
        {Array.from({ length: ROWS }).map((_, r) => (
          <div key={r} style={styles.row}>
            {Array.from({ length: COLS }).map((_, c) => {
              const filled =
                stack.some((b) => b.row === r && b.cols.includes(c)) ||
                (moving.row === r && moving.cols.includes(c));
              return (
                <div
                  key={c}
                  style={{
                    ...styles.cell,
                    ...(filled ? styles.cellActive : {}),
                  }}
                />
              );
            })}
          </div>
        ))}
        {gameOver && (
          <div style={styles.overlay}>
            <h2>{stack.length >= ROWS - 1 ? "🏆 YOU WIN!" : "💥 GAME OVER"}</h2>
            <button style={styles.btn} onClick={restart}>
              RESTART (R)
            </button>
          </div>
        )}
      </div>
      <div style={styles.minorPrize}>MINOR PRIZE</div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at center, #03041a 0%, #000 100%)",
    fontFamily: "Orbitron, sans-serif",
  },
  cabinet: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "10px solid #222",
    borderRadius: 12,
    background: "#0a0d30",
    boxShadow: "0 0 40px rgba(0,0,128,0.7)",
  },
  majorPrize: {
    background: "linear-gradient(90deg, #d4af37, #f9e076)",
    color: "#1e1e1e",
    padding: "4px 20px",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 14,
    borderBottom: "2px solid #fff",
    borderRadius: "8px 8px 0 0",
  },
  minorPrize: {
    background: "linear-gradient(90deg, #a8a8a8, #f0f0f0)",
    color: "#1e1e1e",
    padding: "4px 20px",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 14,
    borderTop: "2px solid #fff",
    borderRadius: "0 0 8px 8px",
  },
  grid: {
    position: "relative",
    display: "flex",
    flexDirection: "column-reverse",
    border: "3px solid #fff",
    background: "radial-gradient(circle at center, #060a40 0%, #020326 100%)",
  },
  row: { display: "flex" },
  cell: {
    width: 28,
    height: 28,
    border: "1px solid rgba(255,255,255,0.1)",
    boxSizing: "border-box",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cellActive: {
    background: "radial-gradient(circle, #fff 30%, #88f 90%)",
    boxShadow: "0 0 8px #66f, 0 0 12px #33f",
  },
  overlay: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#fff",
    textShadow: "0 0 6px #000",
  },
  btn: {
    background: "#ffcc00",
    border: "none",
    color: "#000",
    padding: "6px 14px",
    marginTop: 10,
    fontWeight: "bold",
    borderRadius: 6,
    cursor: "pointer",
  },
};
