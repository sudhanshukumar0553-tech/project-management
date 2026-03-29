"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { membersApi, searchApi } from "@/lib/api";
import type { Member } from "@/types";

interface SearchFilterProps {
  boardId: number;
  onResults: (filteredCardIds: Set<number> | null) => void;
}

export interface FilterState {
  filteredCardIds: Set<number> | null;
}

const LABEL_COLORS = [
  "#0079bf",
  "#61bd4f",
  "#f2d600",
  "#ff9f1a",
  "#eb5a46",
  "#c377e0",
  "#ff78cb",
  "#00c2e0",
  "#51e898",
  "#172b4d",
];

const DUE_DATE_OPTIONS = [
  { value: "overdue", label: "Overdue" },
  { value: "this_week", label: "Due this week" },
  { value: "no_date", label: "No due date" },
] as const;

const getInitials = (name: string) => {
  const [first, second] = name.trim().split(" ");
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase() || "?";
};

export function SearchFilter({ boardId, onResults }: SearchFilterProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [labelColor, setLabelColor] = useState("");
  const [memberId, setMemberId] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState<"" | "overdue" | "this_week" | "no_date">("");
  const [openMenu, setOpenMenu] = useState<null | "label" | "member" | "due">(null);

  const hasActiveFilters = useMemo(
    () => Boolean(debouncedQuery || labelColor || memberId || dueDateFilter),
    [debouncedQuery, labelColor, memberId, dueDateFilter],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await membersApi.getAll();
        setMembers(response.data as Member[]);
      } catch (error) {
        console.error("Failed to load members", error);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      if (!hasActiveFilters) {
        onResults(null);
        return;
      }

      try {
        const params: Record<string, string | number> = { boardId };
        if (debouncedQuery) params.q = debouncedQuery;
        if (labelColor) params.labelColor = labelColor;
        if (memberId) params.memberId = memberId;
        if (dueDateFilter) params.dueDateFilter = dueDateFilter;

        const response = await searchApi(params);
        const cardIds = Array.isArray(response.data?.cardIds)
          ? (response.data.cardIds as number[])
          : [];
        onResults(new Set(cardIds));
      } catch (error) {
        console.error("Search failed", error);
        onResults(null);
      }
    };

    runSearch();
  }, [boardId, debouncedQuery, labelColor, memberId, dueDateFilter, hasActiveFilters, onResults]);

  const clearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setLabelColor("");
    setMemberId("");
    setDueDateFilter("");
    setOpenMenu(null);
    onResults(null);
  };

  return (
    <div className="w-full bg-black/20 backdrop-blur-sm border-b border-white/20 px-4 py-2">
      <div className="flex flex-wrap items-center gap-2 text-white">
        <div className="relative min-w-55 flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/80" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cards"
            className="w-full h-9 rounded-md bg-white/20 border border-white/30 pl-9 pr-3 text-sm placeholder:text-white/70 outline-none focus:border-white"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenMenu((prev) => (prev === "label" ? null : "label"))}
            className="h-9 px-3 rounded-md bg-white/20 border border-white/30 text-sm flex items-center gap-2 hover:bg-white/30"
          >
            Label
            <ChevronDown className="h-4 w-4" />
          </button>
          {openMenu === "label" ? (
            <div className="absolute z-20 mt-2 w-52 rounded-md bg-white p-3 text-[#172b4d] shadow-xl">
              <div className="grid grid-cols-5 gap-2">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setLabelColor((prev) => (prev === color ? "" : color));
                      setOpenMenu(null);
                    }}
                    className="h-7 w-7 rounded"
                    style={{
                      backgroundColor: color,
                      outline: labelColor === color ? "2px solid #172b4d" : "none",
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenMenu((prev) => (prev === "member" ? null : "member"))}
            className="h-9 px-3 rounded-md bg-white/20 border border-white/30 text-sm flex items-center gap-2 hover:bg-white/30"
          >
            Member
            <ChevronDown className="h-4 w-4" />
          </button>
          {openMenu === "member" ? (
            <div className="absolute z-20 mt-2 w-64 rounded-md bg-white p-2 text-[#172b4d] shadow-xl max-h-64 overflow-y-auto">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setMemberId((prev) => (prev === String(member.id) ? "" : String(member.id)));
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-2 py-2 rounded hover:bg-neutral-100 flex items-center gap-2"
                >
                  <span
                    className="h-7 w-7 rounded-full text-white text-xs font-semibold flex items-center justify-center"
                    style={{ backgroundColor: member.color }}
                  >
                    {getInitials(member.name)}
                  </span>
                  <span className="text-sm">{member.name}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenMenu((prev) => (prev === "due" ? null : "due"))}
            className="h-9 px-3 rounded-md bg-white/20 border border-white/30 text-sm flex items-center gap-2 hover:bg-white/30"
          >
            Due Date
            <ChevronDown className="h-4 w-4" />
          </button>
          {openMenu === "due" ? (
            <div className="absolute z-20 mt-2 w-48 rounded-md bg-white p-2 text-[#172b4d] shadow-xl">
              {DUE_DATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDueDateFilter((prev) => (prev === option.value ? "" : option.value));
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-2 py-2 rounded hover:bg-neutral-100 text-sm"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {hasActiveFilters ? (
          <button
            onClick={clearFilters}
            className="h-9 px-3 rounded-md bg-white text-[#172b4d] text-sm font-semibold hover:bg-neutral-100 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
