"use client";

import { BoardScreen } from "@/components/BoardScreen";

const DEFAULT_BOARD_ID = 1;

export default function BoardPage() {
  return <BoardScreen boardId={DEFAULT_BOARD_ID} />;
}
