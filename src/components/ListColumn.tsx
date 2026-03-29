"use client";

import { useEffect, useMemo, useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Plus, X } from "lucide-react";
import type { Card, List } from "@/types";
import type { FilterState } from "@/components/SearchFilter";
import { CardItem } from "@/components/CardItem";

interface ListColumnProps {
  list: List;
  onCardClick: (card: Card) => void;
  onCardCreate: (listId: number, title: string) => Promise<void>;
  onListUpdate: (listId: number, title: string) => Promise<void>;
  onListDelete: (listId: number) => Promise<void>;
  activeFilters: FilterState;
}

interface SortableCardProps {
  card: Card;
  onClick: () => void;
  dimmed: boolean;
}

function SortableCard({ card, onClick, dimmed }: SortableCardProps) {
  return (
    <div className={dimmed ? "opacity-40 pointer-events-none" : "opacity-100"}>
      <CardItem card={card} onClick={onClick} />
    </div>
  );
}

export function ListColumn({
  list,
  onCardClick,
  onCardCreate,
  onListUpdate,
  onListDelete,
  activeFilters,
}: ListColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `list-${list.id}`,
    data: {
      type: "list",
      listId: list.id,
    },
  });

  useEffect(() => {
    setTitleDraft(list.title);
  }, [list.title]);

  const cardIds = useMemo(() => list.cards.map((card) => `card-${card.id}`), [list.cards]);

  const saveTitle = async () => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle || nextTitle === list.title) {
      setTitleDraft(list.title);
      setIsEditingTitle(false);
      return;
    }

    await onListUpdate(list.id, nextTitle);
    setIsEditingTitle(false);
  };

  const handleCreateCard = async () => {
    const cardTitle = newCardTitle.trim();
    if (!cardTitle) return;

    await onCardCreate(list.id, cardTitle);
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="w-72 shrink-0 bg-[#ebecf0] rounded-lg p-2 h-fit max-h-[calc(100vh-130px)] flex flex-col"
    >
      <div className="flex items-center justify-between px-1 pb-2" {...attributes} {...listeners}>
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
            className="h-8 flex-1 rounded border border-[#0079bf] px-2 text-sm font-semibold text-[#172b4d] outline-none"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-sm font-semibold text-[#172b4d] px-1 py-1 rounded hover:bg-black/5 text-left flex-1"
          >
            {list.title}
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="h-7 w-7 rounded hover:bg-black/5 flex items-center justify-center"
          >
            <MoreHorizontal className="h-4 w-4 text-[#42526e]" />
          </button>

          {showMenu ? (
            <div className="absolute right-0 top-8 z-20 bg-white rounded-md shadow-lg border border-neutral-200 p-1 min-w-32">
              <button
                onClick={() => void onListDelete(list.id)}
                className="w-full text-left px-2 py-1.5 rounded text-sm text-rose-600 hover:bg-rose-50"
              >
                Delete list
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => {
            const dimmed =
              activeFilters.filteredCardIds !== null &&
              !activeFilters.filteredCardIds.has(card.id);

            return (
              <SortableCard
                key={card.id}
                card={card}
                onClick={() => onCardClick(card)}
                dimmed={dimmed}
              />
            );
          })}
        </SortableContext>
      </div>

      <div className="pt-2">
        {isAddingCard ? (
          <div className="space-y-2">
            <textarea
              value={newCardTitle}
              onChange={(event) => setNewCardTitle(event.target.value)}
              placeholder="Enter a title for this card..."
              rows={3}
              className="w-full rounded border border-neutral-300 bg-white p-2 text-sm text-[#172b4d] outline-none focus:border-[#0079bf] resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => void handleCreateCard()}
                className="h-8 px-3 rounded bg-[#0079bf] hover:bg-[#026aa7] text-white text-sm"
              >
                Add card
              </button>
              <button
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle("");
                }}
                className="h-8 w-8 rounded hover:bg-black/5 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-[#42526e]" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full h-9 rounded text-sm text-[#5e6c84] hover:bg-black/5 flex items-center gap-2 px-2"
          >
            <Plus className="h-4 w-4" />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
