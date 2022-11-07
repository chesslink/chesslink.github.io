import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMemo, useState } from "react";
import { twCascade } from "@mariusmarais/tailwind-cascade";

const PAWN = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK = 4;
const QUEEN = 5;
const KING = 6;
const BLACK = 8;
const WHITE = 0;

const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function Home() {
  const [history, setHistory] = useState<number[][]>([]);
  const [cursorPos, setCursorPos] = useState<number[] | null>(null);

  const initialBoard = useMemo(() => parseFen(FEN).board, [FEN]);

  const board = useMemo(() => {
    const board = [...initialBoard];

    for (const [from, to] of history) {
      board[to] = board[from];
      board[from] = 0;
    }

    return board;
  }, [FEN, history]);

  const blacksMove = history.length % 2 != 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
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
                        if (Array.isArray(cursorPos)) {
                          if (cursorPos[0] === row && cursorPos[1] === col) {
                          } else {
                            const newHistory = [...history];
                            newHistory.push([
                              cursorPos[0] * 8 + cursorPos[1],
                              row * 8 + col,
                            ]);
                            setHistory(newHistory);
                          }
                          setCursorPos(null);
                        } else {
                          if (board[row * 8 + col]) {
                            setCursorPos([row, col]);
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
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map(([from, to], i) => (
          <div key={i}>
            {from},{to}
          </div>
        ))}
      </div>
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
