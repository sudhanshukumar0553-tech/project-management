"use client";

import { useParams } from "next/navigation";
import { BoardScreen } from "@/components/BoardScreen";

export default function BoardByIdPage() {
  const params = useParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const parsedId = Number.parseInt(rawId ?? "1", 10);
  const boardId = Number.isNaN(parsedId) ? 1 : parsedId;

  return <BoardScreen boardId={boardId} />;
}
