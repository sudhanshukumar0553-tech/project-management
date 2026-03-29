"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { boardsApi } from "@/lib/api";

interface BoardSummary {
  id: number;
  title: string;
  bgColor: string;
}

const PRESET_COLORS = ["#0079bf", "#61bd4f", "#f2d600", "#ff9f1a", "#eb5a46", "#c377e0"];

export default function BoardsPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardColor, setNewBoardColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const response = await boardsApi.getAll();
        setBoards(response.data as BoardSummary[]);
      } catch (error) {
        console.error("Failed to load boards", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchBoards();
  }, []);

  const createBoard = async () => {
    const title = newBoardTitle.trim();
    if (!title) return;

    try {
      const response = await boardsApi.create({ title, bgColor: newBoardColor });
      const created = response.data as BoardSummary;
      setBoards((prev) => [...prev, created]);
      setNewBoardTitle("");
      setNewBoardColor(PRESET_COLORS[0]);
      setShowCreate(false);
    } catch (error) {
      console.error("Failed to create board", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#172b4d] mb-6">My Boards</h1>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-[#0079bf]/30 border-t-[#0079bf] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="h-24 rounded-md p-3 flex items-end text-white font-semibold shadow hover:brightness-95 transition"
                style={{ backgroundColor: board.bgColor || "#0079bf" }}
              >
                <span className="line-clamp-2 text-sm">{board.title}</span>
              </Link>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowCreate((prev) => !prev)}
                className="h-24 w-full rounded-md border-2 border-dashed border-neutral-300 bg-white text-[#172b4d] text-sm font-medium hover:bg-neutral-100 transition flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create new board
              </button>

              {showCreate ? (
                <div className="absolute left-0 top-28 z-20 w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-xl">
                  <input
                    value={newBoardTitle}
                    onChange={(event) => setNewBoardTitle(event.target.value)}
                    placeholder="Board title"
                    className="w-full h-9 rounded border border-neutral-300 px-2 text-sm outline-none focus:border-[#0079bf]"
                  />

                  <div className="mt-3 flex items-center gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewBoardColor(color)}
                        className="h-7 w-7 rounded"
                        style={{
                          backgroundColor: color,
                          outline: newBoardColor === color ? "2px solid #172b4d" : "none",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => void createBoard()}
                    className="mt-3 w-full h-9 rounded bg-[#0079bf] text-white text-sm font-medium hover:bg-[#026aa7]"
                  >
                    Create
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
