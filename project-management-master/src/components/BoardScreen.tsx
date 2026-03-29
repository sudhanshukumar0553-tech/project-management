"use client";

import { useEffect, useState } from "react";
import { Star, SlidersHorizontal } from "lucide-react";
import { Board } from "@/components/board";
import { boardsApi, membersApi } from "@/lib/api";
import type { Member } from "@/types";

const PRESET_BG_COLORS = ["#0079bf", "#61bd4f", "#f2d600", "#ff9f1a", "#eb5a46", "#c377e0", "#172b4d"];

interface BoardScreenProps {
  boardId: number;
}

export function BoardScreen({ boardId }: BoardScreenProps) {
  const [boardTitle, setBoardTitle] = useState("My Project Board");
  const [titleDraft, setTitleDraft] = useState("My Project Board");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [bgColor, setBgColor] = useState("#0079bf");
  const [showFilters, setShowFilters] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const [boardResponse, membersResponse] = await Promise.all([
          boardsApi.getById(boardId),
          membersApi.getAll(),
        ]);

        const board = boardResponse.data as { title: string; bgColor: string };
        setBoardTitle(board.title);
        setTitleDraft(board.title);
        setBgColor(board.bgColor || "#0079bf");
        setMembers(membersResponse.data as Member[]);
      } catch (error) {
        console.error("Failed to load board header data", error);
      }
    };

    void fetchHeaderData();
  }, [boardId]);

  const saveTitle = async () => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle || nextTitle === boardTitle) {
      setTitleDraft(boardTitle);
      setIsEditingTitle(false);
      return;
    }

    try {
      await boardsApi.update(boardId, { title: nextTitle });
      setBoardTitle(nextTitle);
    } catch (error) {
      console.error("Failed to update board title", error);
      setTitleDraft(boardTitle);
    } finally {
      setIsEditingTitle(false);
    }
  };

  const updateBoardColor = async (color: string) => {
    try {
      await boardsApi.update(boardId, { bgColor: color });
      setBgColor(color);
      setShowBgPicker(false);
    } catch (error) {
      console.error("Failed to update board background", error);
    }
  };

  return (
    <div className="h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      <div className="h-12 w-full bg-black/15 backdrop-blur-sm border-b border-white/20 px-4 flex items-center justify-between text-white text-sm">
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={() => void saveTitle()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void saveTitle();
                }
              }}
              className="h-8 rounded bg-white/20 border border-white/40 px-2 text-white text-sm font-semibold outline-none min-w-40"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="h-8 px-2 rounded hover:bg-white/20 font-semibold truncate max-w-56 text-left"
            >
              {boardTitle}
            </button>
          )}

          <button className="h-8 w-8 rounded hover:bg-white/20 flex items-center justify-center">
            <Star className="h-4 w-4" />
          </button>

          <span className="h-4 w-px bg-white/40" />

          <span className="h-8 px-2 rounded bg-white/15 flex items-center">Workspace</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowBgPicker((prev) => !prev)}
              className="h-8 px-3 rounded bg-white/20 hover:bg-white/30"
            >
              Background
            </button>

            {showBgPicker ? (
              <div className="absolute right-0 top-10 z-30 w-56 rounded-md border border-white/20 bg-[#1f2937]/95 p-3 shadow-xl">
                <p className="text-xs text-white/80 mb-2">Choose board color</p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_BG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => void updateBoardColor(color)}
                      className="h-8 rounded"
                      style={{
                        backgroundColor: color,
                        outline: bgColor === color ? "2px solid #fff" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="h-8 px-3 rounded bg-white/20 hover:bg-white/30 flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          <button className="h-8 px-3 rounded bg-white/20 hover:bg-white/30">Share</button>

          <div className="flex -space-x-1">
            {members.slice(0, 4).map((member) => (
              <span
                key={member.id}
                className="h-8 w-8 rounded-full border border-white text-[10px] font-semibold text-white flex items-center justify-center"
                style={{ backgroundColor: member.color }}
                title={member.name}
              >
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Board boardId={boardId} showFilters={showFilters} />
    </div>
  );
}
