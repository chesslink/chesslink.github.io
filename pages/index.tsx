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
  const { w: whitePlayer, b: blackPlayer, h: inputHistory } = router.query;

  const history = useMemo(() => {
    const dest = [];
    const src = inputHistory || [];
    for (let i = 0; i < src.length; i += 2) {
      const from = BASE64.indexOf(src[i + 0]);
      const to = BASE64.indexOf(src[i + 1]);
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
    () => `?w=${whitePlayer}&b=${blackPlayer}&h=${newEncodedHistory}`,
    [newEncodedHistory, blackPlayer, whitePlayer]
  );

  const { x0, y0, dx, dy } = useMemo(() => {
    if (Array.isArray(move)) {
      const x0 = 1 + 2 * (move[0] % 8);
      const y0 = 1 + 2 * Math.floor(move[0] / 8);

      const x1 = 1 + 2 * (move[1] % 8);
      const y1 = 1 + 2 * Math.floor(move[1] / 8);

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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div>Black: {blackPlayer}</div>
      <div>{blacksMove ? "Black" : "White"} to move</div>
      <div className="relative text-6xl">
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
                        "bg-slate-300": (row ^ col) & 1,
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
                                cursorPos[0] * 8 + cursorPos[1],
                                row * 8 + col,
                              ]);
                              // setHistory(newHistory);
                            }
                            setCursorPos(null);
                          } else {
                            if (board[row * 8 + col]) {
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
          .map((piece, i) => ({ piece, row: Math.floor(i / 8), col: i % 8 }))
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
      </div>
      <div>White: {whitePlayer}</div>

      <button
        style={{ all: "revert" }}
        disabled={move === null}
        onClick={() => void setMove(null)}
      >
        Undo
      </button>

      <form
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
      </form>

      {Array.isArray(move) && <Link href={newStateLink} target="_blank">{newStateLink}</Link>}
      {Array.isArray(move) && (
        <a
          href={`mailto:${blackPlayer}?&subject=${encodeURIComponent(
            "[chessbyemail.com] Your move"
          )}&body=${encodeURI("http://localhost:3000/" + newStateLink)}`}
        >
          Send move to opponent
        </a>
      )}
    </div>
  );
}

function Piece({ piece }: { piece: number }) {
  return (
    <div className="relative h-16 w-16">
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
