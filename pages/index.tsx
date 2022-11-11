import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { ReactHTMLElement, useEffect, useMemo, useRef, useState } from "react";
import { twCascade } from "@mariusmarais/tailwind-cascade";
import { useRouter } from "next/router";
import Link from "next/link";

const PAWN = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK = 4;
const QUEEN = 5;
const KING = 6;
const BLACK = 8;
const WHITE = 0;

const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const BASE64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export default function Home() {
  const router = useRouter();
  const { state: inputHistory } = router.query;

  const history = useMemo(() => {
    const dest = [];
    const src = inputHistory || [];
    for (let i = 0; i < src.length; i += 2) {
      let from = BASE64.indexOf(src[i + 0]);
      let to = BASE64.indexOf(src[i + 1]);

      dest.push([from, to]);
    }
    return dest;
  }, [inputHistory]);

  // const [history, setHistory] = useState<number[][]>([]);
  const [cursorPos, setCursorPos] = useState<number[] | null>(null);
  const [hoverPos, setHoverPos] = useState<number[] | null>(null);

  const initialBoard = useMemo(() => parseFen(FEN).board, [FEN]);

  const [move, setMove] = useState<number[] | null>(null);

  const { board, lostPieces } = useMemo(() => {
    const board = [...initialBoard];
    const lostPieces = [];

    for (const [from, to] of history) {
      if (board[to]) {
        lostPieces.push(board[to]);
      }
      board[to] = board[from];
      board[from] = 0;
    }

    if (Array.isArray(move)) {
      const [from, to] = move;
      if (board[to]) {
        lostPieces.push(board[to]);
      }
      board[to] = board[from];
      board[from] = 0;
    }

    return { board, lostPieces };
  }, [FEN, history, move]);

  const blacksMove = history.length % 2 != 0;

  const newEncodedHistory = useMemo(
    () =>
      history
        .concat([move || []])
        .flat()
        .map((x) => BASE64[x])
        .join(""),
    [history, move]
  );

  const newStateLink = useMemo(() => {
    return `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/?state=${newEncodedHistory}`;
  }, [newEncodedHistory]);

  const { x0, y0, dx, dy } = useMemo(() => {
    if (Array.isArray(move)) {
      const from = rowcol(move[0], blacksMove);
      const to = rowcol(move[1], blacksMove);

      const x0 = 1 + 2 * from[1];
      const y0 = 1 + 2 * from[0];

      const x1 = 1 + 2 * to[1];
      const y1 = 1 + 2 * to[0];

      const dx = x1 - x0;
      const dy = y1 - y0;

      const norm = Math.sqrt(dx * dx + dy * dy);

      const ndx = dx / norm;
      const ndy = dy / norm;

      return { x0, y0, dx: ndx * (norm - 0.71), dy: ndy * (norm - 0.71) };
    } else {
      return {};
    }
  }, [move]);

  const [showLink, setShowLink] = useState(false);

  const linkInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // TODO: use input onChange event instead?
    if (Array.isArray(move)) {
      linkInputRef.current?.focus();
    }
  }, [move]);

  const possibleMoves = useMemo<number[][]>(() => {
    const moves = [];
    if (Array.isArray(hoverPos)) {
      const [row, col] = hoverPos;

      switch (board[row * 8 + col] & 7) {
        case PAWN:
          if (board[(row - 1) * 8 + col] === 0) {
            moves.push([row - 1, col]);
          }
          if (board[(row - 1) * 8 + col - 1] >= BLACK) {
            moves.push([row - 1, col - 1]);
          }
          if (board[(row - 1) * 8 + col + 1] >= BLACK) {
            moves.push([row - 1, col + 1]);
          }
          if (row === 6 && board[(row - 2) * 8 + col] === 0) {
            moves.push([row - 2, col]);
          }
          break;
        // case KNIGHT:
        case BISHOP:
          for (const [dr, dc] of [
            [-1, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
          ]) {
            for (
              let [r, c] = [row + dr, col + dc];
              r >= 0 && r < 8 && c >= 0 && c < 8;
              r += dr, c += dc
            ) {
              if (board[r * 8 + c] && board[r * 8 + c] < BLACK) {
                break;
              }
              moves.push([r, c]);
              if (board[r * 8 + c] >= BLACK) {
                break;
              }
            }
          }
          break;
        case ROOK:
          for (const [dr, dc] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ]) {
            for (
              let [r, c] = [row + dr, col + dc];
              r >= 0 && r < 8 && c >= 0 && c < 8;
              r += dr, c += dc
            ) {
              if (board[r * 8 + c] && board[r * 8 + c] < BLACK) {
                break;
              }
              moves.push([r, c]);
              if (board[r * 8 + c] >= BLACK) {
                break;
              }
            }
          }
          break;
        case QUEEN:
          for (const [dr, dc] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
          ]) {
            for (
              let [r, c] = [row + dr, col + dc];
              r >= 0 && r < 8 && c >= 0 && c < 8;
              r += dr, c += dc
            ) {
              if (board[r * 8 + c] && board[r * 8 + c] < BLACK) {
                break;
              }
              moves.push([r, c]);
              if (board[r * 8 + c] >= BLACK) {
                break;
              }
            }
          }
          break;
      }

      return moves.filter(
        ([row, col]) => row >= 0 && row < 8 && col >= 0 && col < 8
      );
    } else {
      return [];
    }
  }, [board, hoverPos]);

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center gap-4 py-4">
      <h1 className="text-3xl font-black">
        chess<span className="text-slate-400">by</span>email
        <span className="text-2xl">.com</span>
      </h1>
      <div className="flex flex-col">
        <div className="flex flex-row justify-start h-16 -space-x-4">
          {lostPieces
            .filter((piece) => (blacksMove ? piece < BLACK : piece >= BLACK))
            .map((piece, i) => (
              <RawPiece key={i} className="" piece={piece} />
            ))}
        </div>
        <div className="flex flex-row w-full justify-center text-slate-500 font-bold">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-16 text-center rotate-180">
                {"ABCDEFGH"[blacksMove ? 7 - i : i]}
              </div>
            ))}
        </div>
        <div className="flex flex-row">
          <div className="flex flex-col h-full justify-center items-center w-6 text-slate-500 font-bold">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-16 flex items-center">
                  {blacksMove ? 1 + i : 8 - i}
                </div>
              ))}
          </div>
          <div className="relative border-slate-300 border-8 border-double">
            <div className="flex flex-col">
              {Array(8)
                .fill(0)
                .map((_, row) => (
                  <div key={row} className="flex flex-row">
                    {Array(8)
                      .fill(0)
                      .map((_, col) => (
                        <button
                          key={col}
                          className={twCascade("w-16 h-16 relative", {
                            "bg-slate-300":
                              ((row ^ col) & 1) ^ (blacksMove ? 1 : 0),
                            "border-solid border-4 border-slate-600":
                              Array.isArray(cursorPos) &&
                              cursorPos[0] === row &&
                              cursorPos[1] === col,
                          })}
                          onClick={(ev) => {
                            if (move === null) {
                              const p = board[boardIndex(row, col, blacksMove)];

                              if (
                                Array.isArray(cursorPos) &&
                                cursorPos[0] === row &&
                                cursorPos[1] === col
                              ) {
                                setCursorPos(null);
                              } else if (
                                p != 0 &&
                                ((p >= BLACK && blacksMove) ||
                                  (p < BLACK && !blacksMove))
                              ) {
                                setCursorPos([row, col]);
                              } else if (Array.isArray(cursorPos)) {
                                // const newHistory = [...history];
                                // newHistory.push([
                                //   cursorPos[0] * 8 + cursorPos[1],
                                //   row * 8 + col,
                                // ]);
                                setMove([
                                  boardIndex(...cursorPos, blacksMove),
                                  boardIndex(row, col, blacksMove),
                                ]);
                                // setHistory(newHistory);
                              }
                            }
                          }}
                          onMouseOver={() => void setHoverPos([row, col])}
                          onMouseOut={() => void setHoverPos(null)}
                        ></button>
                      ))}
                  </div>
                ))}
            </div>
            {possibleMoves.map(([row, col], i) => (
              <div
                key={i}
                className="absolute h-16 w-16 pointer-events-none border-solid border-4 border-slate-500 rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ top: row * 64 + 32, left: col * 64 + 32 }}
              ></div>
            ))}
            {board
              .map((piece, i) => ({
                piece,
                row: Math.floor(i / 8) ^ (blacksMove ? 7 : 0),
                col: i % 8 ^ (blacksMove ? 7 : 0),
              }))
              .filter(({ piece }) => piece !== 0)
              .map(({ piece, row, col }, i) => (
                <div
                  key={i}
                  className="absolute h-16 w-16 pointer-events-none"
                  style={{ top: row * 64, left: col * 64 }}
                >
                  <Piece piece={piece} />
                </div>
              ))}
            <svg
              className="absolute inset-0 pointer-events-none"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 1 1"
                  refX="0.5"
                  refY="0.5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 1 0.5 L 0 1 z" />
                </marker>
                <marker
                  id="dot"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                >
                  <circle cx="5" cy="5" r="5" fill="red" />
                </marker>
              </defs>
              {Array.isArray(move) && (
                <>
                  <polyline
                    points={`${x0},${y0} ${x0 + dx},${y0 + dy}`}
                    fill="none"
                    strokeWidth="0.1"
                    stroke="black"
                    markerEnd="url(#arrow)"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </div>
          <div className="flex flex-col h-full justify-center items-center w-6 text-slate-500 font-bold">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-16 flex items-center rotate-180">
                  {blacksMove ? 1 + i : 8 - i}
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-row w-full justify-center text-slate-500 font-bold">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-16 text-center">
                {"ABCDEFGH"[blacksMove ? 7 - i : i]}
              </div>
            ))}
        </div>
        <div className="flex flex-row justify-start h-16 -space-x-4">
          {lostPieces
            .filter((piece) => (blacksMove ? piece >= BLACK : piece < BLACK))
            .map((piece, i) => (
              <RawPiece key={i} className="" piece={piece} />
            ))}
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <p>{blacksMove ? "Black" : "White"} player</p>
        <p>Your move</p>

        <div className="outline-1 outline outline-black w-24 text-center">
          {Array.isArray(move)
            ? `${PIECES.get(board[move[1]])} ${posString(
                move[0]
              )} to ${posString(move[1])}`
            : " "}
        </div>

        <button
          style={{ all: "revert" }}
          disabled={move === null}
          onClick={() => void setMove(null)}
        >
          Undo
        </button>
      </div>
      <div
        className={twCascade(
          "flex flex-col gap-2 items-center bg-slate-200 rounded-lg py-4 px-8",
          {
            "opacity-0": move === null,
          }
        )}
      >
        <p className="text-center">Send the following link to your opponent</p>
        <div className="flex flex-row gap-1">
          <input
            ref={linkInputRef}
            style={{ all: "revert" }}
            type="text"
            value={newStateLink}
            readOnly
            onFocus={(ev) => void ev.target.select()}
          />
          <button
            style={{ all: "revert" }}
            onClick={() => {
              window.navigator.clipboard.writeText(newStateLink);
            }}
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}

function Piece({ className, piece }: { className: string; piece: number }) {
  return (
    <div className={twCascade("relative h-16 w-16 text-6xl", className)}>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
        {(piece >= BLACK ? WHITE_PIECES : BLACK_PIECES).get(piece & 7)}
      </span>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {(piece < BLACK ? WHITE_PIECES : BLACK_PIECES).get(piece & 7)}
      </span>
    </div>
  );
}

function RawPiece({ className, piece }: { className: string; piece: number }) {
  return (
    <div className={twCascade("text-6xl", className)}>
      {(piece < BLACK ? WHITE_PIECES : BLACK_PIECES).get(piece & 7)}
    </div>
  );
}

const parseFen = (fen: string) => {
  const map = new Map([
    ["p", BLACK + PAWN],
    ["n", BLACK + KNIGHT],
    ["b", BLACK + BISHOP],
    ["r", BLACK + ROOK],
    ["q", BLACK + QUEEN],
    ["k", BLACK + KING],
    ["P", WHITE + PAWN],
    ["N", WHITE + KNIGHT],
    ["B", WHITE + BISHOP],
    ["R", WHITE + ROOK],
    ["Q", WHITE + QUEEN],
    ["K", WHITE + KING],
  ]);

  const board = [];
  for (const c of fen) {
    if (board.length < 64) {
      if (map.has(c)) {
        board.push(map.get(c));
      } else if (/^[0-9]$/.test(c)) {
        board.push(...Array(parseInt(c)).fill(0));
      }
    }
  }

  return { board };
};

const WHITE_PIECES = new Map([
  [0, " "],
  [PAWN, "♙"],
  [KNIGHT, "♘"],
  [BISHOP, "♗"],
  [ROOK, "♖"],
  [QUEEN, "♕"],
  [KING, "♔"],
]);

const BLACK_PIECES = new Map([
  [0, " "],
  [PAWN, "♟"],
  [KNIGHT, "♞"],
  [BISHOP, "♝"],
  [ROOK, "♜"],
  [QUEEN, "♛"],
  [KING, "♚"],
]);

const PIECES = new Map([
  [0, " "],
  [WHITE + PAWN, "♙"],
  [WHITE + KNIGHT, "♘"],
  [WHITE + BISHOP, "♗"],
  [WHITE + ROOK, "♖"],
  [WHITE + QUEEN, "♕"],
  [WHITE + KING, "♔"],
  [BLACK + PAWN, "♟"],
  [BLACK + KNIGHT, "♞"],
  [BLACK + BISHOP, "♝"],
  [BLACK + ROOK, "♜"],
  [BLACK + QUEEN, "♛"],
  [BLACK + KING, "♚"],
]);

function posString(pos: number) {
  if (isFinite(pos)) {
    const col = "ABCDEFGH"[pos % 8];
    const row = "87654321"[Math.floor(pos / 8)];
    return col + row;
  } else {
    return "";
  }
}

function boardIndex(row: number, col: number, blacksMove: boolean) {
  return (row * 8 + col) ^ (blacksMove ? 63 : 0);
}

function rowcol(boardIndex: number, blacksMove: boolean) {
  let row = Math.floor(boardIndex / 8);
  let col = boardIndex % 8;

  if (blacksMove) {
    row = 7 - row;
    col = 7 - col;
  }

  return [row, col];
}
