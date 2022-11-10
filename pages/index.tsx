import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMemo, useState } from "react";
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

  const initialBoard = useMemo(() => parseFen(FEN).board, [FEN]);

  const [move, setMove] = useState<number[] | null>(null);

  const board = useMemo(() => {
    const board = [...initialBoard];

    for (const [from, to] of history) {
      board[to] = board[from];
      board[from] = 0;
    }

    if (Array.isArray(move)) {
      const [from, to] = move;
      board[to] = board[from];
      board[from] = 0;
    }

    return board;
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

  const newStateLink = useMemo(
    () => `http://localhost:3000/?state=${newEncodedHistory}`,
    [newEncodedHistory]
  );

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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
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
                        "border-solid border-2 border-black":
                          Array.isArray(cursorPos) &&
                          cursorPos[0] === row &&
                          cursorPos[1] === col,
                      })}
                      onClick={(ev) => {
                        if (move === null) {
                          if (Array.isArray(cursorPos)) {
                            if (cursorPos[0] === row && cursorPos[1] === col) {
                            } else {
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
                            setCursorPos(null);
                          } else {
                            const p = board[boardIndex(row, col, blacksMove)];

                            if (
                              p != 0 &&
                              ((p >= BLACK && blacksMove) ||
                                (p < BLACK && !blacksMove))
                            ) {
                              setCursorPos([row, col]);
                            }
                          }
                        }
                      }}
                    ></button>
                  ))}
              </div>
            ))}
        </div>
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
                marker-end="url(#arrow)"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        {showLink && <></>}
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
      {/* <form
        action="."
        onSubmit={(ev) => {
          ev.preventDefault();

          const encodedHistory = history
            .concat([move || []])
            .flat()
            .map((x) => BASE64[x])
            .join("");

          router.push(`./?h=${encodedHistory}`);
          setMove(null);
        }}
      >
        <input
          type="submit"
          value="Send move"
          style={{ all: "revert" }}
          disabled={move === null}
        />
      </form> */}

      <div
        className={twCascade(
          "flex flex-col gap-2 items-center bg-slate-200 rounded-lg py-4 px-8",
          {
            "opacity-0": move === null,
          }
        )}
      >
        <p className="text-center">
          Send the following link to your opponent
        </p>
        <div className="flex flex-row gap-1">
          <input
            style={{ all: "revert" }}
            type="text"
            value={newStateLink}
            readOnly
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

function Piece({ piece }: { piece: number }) {
  return (
    <div className="relative h-16 w-16 text-6xl">
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
        {(piece >= BLACK ? WHITE_PIECES : BLACK_PIECES).get(piece & 7)}
      </span>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {(piece < BLACK ? WHITE_PIECES : BLACK_PIECES).get(piece & 7)}
      </span>
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
    const row = "ABCDEFGH"[Math.floor(pos / 8)];
    const col = "12345678"[pos % 8];
    return row + col;
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
