"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare, Paperclip, Pencil } from "lucide-react";
import type { Card } from "@/types";

interface CardItemProps {
  card: Card;
  onClick: () => void;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const formatDueDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export function CardItem({ card, onClick }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: {
      type: "card",
      cardId: card.id,
      listId: card.listId,
    },
  });

  const checklistStats = useMemo(() => {
    const total = card.checklists.reduce((acc, checklist) => acc + checklist.items.length, 0);
    const complete = card.checklists.reduce(
      (acc, checklist) =>
        acc + checklist.items.filter((item) => item.isComplete).length,
      0,
    );

    return { total, complete };
  }, [card.checklists]);

  const dueDateInfo = useMemo(() => {
    if (!card.dueDate) return null;

    const date = new Date(card.dueDate);
    if (Number.isNaN(date.getTime())) return null;

    const now = new Date();
    const allChecklistItemsDone =
      checklistStats.total > 0 && checklistStats.complete === checklistStats.total;

    if (allChecklistItemsDone) {
      return {
        text: formatDueDate(card.dueDate),
        className: "bg-emerald-100 text-emerald-700",
      };
    }

    if (date.getTime() < now.getTime()) {
      return {
        text: formatDueDate(card.dueDate),
        className: "bg-rose-100 text-rose-700",
      };
    }

    return {
      text: formatDueDate(card.dueDate),
      className: "bg-amber-100 text-amber-700",
    };
  }, [card.dueDate, checklistStats.complete, checklistStats.total]);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="bg-white p-2 rounded shadow-sm text-sm text-[#172b4d] hover:bg-neutral-50 cursor-pointer mb-2 border-b border-neutral-200 relative group"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {card.coverColor ? (
        <div
          className="h-1 rounded-t absolute left-0 right-0 top-0"
          style={{ backgroundColor: card.coverColor }}
        />
      ) : null}

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil className="h-3.5 w-3.5 text-[#5e6c84]" />
      </div>

      {card.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1 mb-2 pr-5">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: label.color }}
              title={label.text || "Label"}
            />
          ))}
        </div>
      ) : null}

      <p className="pr-5 whitespace-pre-wrap wrap-break-word">{card.title}</p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-[#5e6c84]">
          {dueDateInfo ? (
            <span className={`px-1.5 py-0.5 rounded ${dueDateInfo.className}`}>
              {dueDateInfo.text}
            </span>
          ) : null}

          {checklistStats.total > 0 ? (
            <span>
              ✓ {checklistStats.complete}/{checklistStats.total}
            </span>
          ) : null}

          {card.attachments.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              {card.attachments.length}
            </span>
          ) : null}

          {card.comments.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {card.comments.length}
            </span>
          ) : null}
        </div>

        {card.members.length > 0 ? (
          <div className="flex -space-x-1">
            {card.members.map(({ member }) => (
              <span
                key={member.id}
                className="h-7 w-7 rounded-full border border-white text-[10px] font-semibold text-white flex items-center justify-center"
                style={{ backgroundColor: member.color }}
                title={member.name}
              >
                {getInitials(member.name)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
