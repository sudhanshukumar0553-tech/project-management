"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { boardsApi, cardsApi, listsApi, membersApi } from "@/lib/api";
import type { Board as BoardType, Card, List, Member } from "@/types";
import { ListColumn } from "./ListColumn";
import { CardModal } from "./CardModal";
import { SearchFilter, type FilterState } from "./SearchFilter";

interface BoardProps {
  boardId?: number;
  showFilters?: boolean;
}

const calculatePosition = <T extends { position: number }>(items: T[], insertIndex: number) => {
  if (items.length === 0 || insertIndex === 0) return 1.0;
  if (insertIndex >= items.length) return items[items.length - 1].position + 1.0;
  return (items[insertIndex - 1].position + items[insertIndex].position) / 2;
};

const parseSortableId = (id: string, prefix: "card-" | "list-") =>
  Number.parseInt(id.replace(prefix, ""), 10);

export const Board = ({ boardId = 1, showFilters = true }: BoardProps) => {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const [filteredCardIds, setFilteredCardIds] = useState<Set<number> | null>(null);

  const [activeList, setActiveList] = useState<List | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const [selectedCard, setSelectedCard] = useState<{
    cardId: number;
    listTitle: string;
  } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const activeFilters: FilterState = useMemo(
    () => ({ filteredCardIds }),
    [filteredCardIds],
  );

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const [boardResponse, membersResponse] = await Promise.all([
        boardsApi.getById(boardId),
        membersApi.getAll(),
      ]);

      setBoard(boardResponse.data as BoardType);
      setMembers(membersResponse.data as Member[]);
    } catch (error) {
      console.error("Failed to load board", error);
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    void fetchBoard();
  }, [fetchBoard]);

  const handleCreateList = async () => {
    if (!board) return;

    const title = newListTitle.trim();
    if (!title) return;

    try {
      const response = await listsApi.create({ title, boardId: board.id });
      const createdList = response.data as List;

      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: [...prev.lists, createdList].sort((a, b) => a.position - b.position),
        };
      });

      setNewListTitle("");
      setIsAddingList(false);
    } catch (error) {
      console.error("Failed to create list", error);
    }
  };

  const handleListUpdate = async (listId: number, title: string) => {
    try {
      await listsApi.update(listId, { title });
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => (list.id === listId ? { ...list, title } : list)),
        };
      });
    } catch (error) {
      console.error("Failed to update list", error);
    }
  };

  const handleListDelete = async (listId: number) => {
    try {
      await listsApi.delete(listId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.filter((list) => list.id !== listId),
        };
      });
    } catch (error) {
      console.error("Failed to delete list", error);
    }
  };

  const handleCardCreate = async (listId: number, title: string) => {
    try {
      const response = await cardsApi.create({ title, listId });
      const newCard = response.data as Card;

      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: [...list.cards, newCard].sort((a, b) => a.position - b.position),
                }
              : list,
          ),
        };
      });
    } catch (error) {
      console.error("Failed to create card", error);
    }
  };

  const handleCardUpdate = useCallback((updatedCard: Card) => {
    setBoard((prev) => {
      if (!prev) return prev;

      const nextLists = prev.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== updatedCard.id),
      }));

      if (!updatedCard.isArchived) {
        const targetList = nextLists.find((list) => list.id === updatedCard.listId);
        if (targetList) {
          targetList.cards = [...targetList.cards, updatedCard].sort(
            (a, b) => a.position - b.position,
          );
        }
      }

      return {
        ...prev,
        lists: nextLists,
      };
    });
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    if (!board) return;

    const activeId = String(event.active.id);

    if (activeId.startsWith("list-")) {
      const listId = parseSortableId(activeId, "list-");
      const list = board.lists.find((item) => item.id === listId) ?? null;
      setActiveList(list);
      setActiveCard(null);
      return;
    }

    if (activeId.startsWith("card-")) {
      const cardId = parseSortableId(activeId, "card-");
      const card =
        board.lists.flatMap((list) => list.cards).find((item) => item.id === cardId) ?? null;
      setActiveCard(card);
      setActiveList(null);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Reserved for future drag-over previews.
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveCard(null);
    setActiveList(null);

    if (!board || !over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    if (activeId.startsWith("list-") && overId.startsWith("list-")) {
      const oldIndex = board.lists.findIndex((list) => `list-${list.id}` === activeId);
      const newIndex = board.lists.findIndex((list) => `list-${list.id}` === overId);

      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      const reordered = arrayMove(board.lists, oldIndex, newIndex);
      const movedList = reordered[newIndex];
      const newPosition = calculatePosition(
        reordered.filter((_, index) => index !== newIndex),
        newIndex,
      );

      const optimisticLists = reordered.map((list, index) =>
        index === newIndex ? { ...list, position: newPosition } : list,
      );

      setBoard((prev) => (prev ? { ...prev, lists: optimisticLists } : prev));

      try {
        await listsApi.updatePosition(movedList.id, newPosition);
      } catch (error) {
        console.error("Failed to persist list order", error);
        void fetchBoard();
      }

      return;
    }

    if (!activeId.startsWith("card-")) return;

    const sourceListIndex = board.lists.findIndex((list) =>
      list.cards.some((card) => `card-${card.id}` === activeId),
    );
    if (sourceListIndex < 0) return;

    const sourceList = board.lists[sourceListIndex];
    const sourceCardIndex = sourceList.cards.findIndex((card) => `card-${card.id}` === activeId);
    if (sourceCardIndex < 0) return;

    let destinationListIndex = -1;
    let destinationCardIndex = -1;

    if (overId.startsWith("card-")) {
      destinationListIndex = board.lists.findIndex((list) =>
        list.cards.some((card) => `card-${card.id}` === overId),
      );

      if (destinationListIndex < 0) return;

      destinationCardIndex = board.lists[destinationListIndex].cards.findIndex(
        (card) => `card-${card.id}` === overId,
      );
    } else if (overId.startsWith("list-")) {
      destinationListIndex = board.lists.findIndex((list) => `list-${list.id}` === overId);
      if (destinationListIndex < 0) return;
      destinationCardIndex = board.lists[destinationListIndex].cards.length;
    }

    if (destinationListIndex < 0 || destinationCardIndex < 0) return;

    const nextLists = board.lists.map((list) => ({
      ...list,
      cards: [...list.cards],
    }));

    const fromList = nextLists[sourceListIndex];
    const toList = nextLists[destinationListIndex];
    const [movingCard] = fromList.cards.splice(sourceCardIndex, 1);

    let insertIndex = destinationCardIndex;
    if (sourceListIndex === destinationListIndex && sourceCardIndex < destinationCardIndex) {
      insertIndex -= 1;
    }

    if (insertIndex < 0) insertIndex = 0;

    const newPosition = calculatePosition(toList.cards, insertIndex);
    const updatedCard: Card = {
      ...movingCard,
      listId: toList.id,
      position: newPosition,
    };

    toList.cards.splice(insertIndex, 0, updatedCard);

    setBoard((prev) =>
      prev
        ? {
            ...prev,
            lists: nextLists,
          }
        : prev,
    );

    try {
      await cardsApi.update(updatedCard.id, {
        listId: updatedCard.listId,
        position: updatedCard.position,
      });
    } catch (error) {
      console.error("Failed to persist card move", error);
      void fetchBoard();
    }
  };

  if (loading || !board) {
    return (
      <div className="h-[calc(100vh-104px)] w-full flex items-center justify-center bg-transparent">
        <div className="h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-104px)] flex flex-col">
      {showFilters ? <SearchFilter boardId={board.id} onResults={setFilteredCardIds} /> : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={(event) => void handleDragEnd(event)}
      >
        <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-start">
          <SortableContext
            items={board.lists.map((list) => `list-${list.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            {board.lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                onCardClick={(card) =>
                  setSelectedCard({
                    cardId: card.id,
                    listTitle: list.title,
                  })
                }
                onCardCreate={handleCardCreate}
                onListUpdate={handleListUpdate}
                onListDelete={handleListDelete}
                activeFilters={activeFilters}
              />
            ))}
          </SortableContext>

          {isAddingList ? (
            <div className="w-72 shrink-0 bg-[#ebecf0] rounded-lg p-2 space-y-2">
              <input
                autoFocus
                value={newListTitle}
                onChange={(event) => setNewListTitle(event.target.value)}
                placeholder="Enter list title"
                className="w-full h-9 rounded border border-neutral-300 px-2 text-sm text-[#172b4d] outline-none focus:border-[#0079bf]"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void handleCreateList()}
                  className="h-8 px-3 rounded bg-[#0079bf] hover:bg-[#026aa7] text-white text-sm"
                >
                  Add list
                </button>
                <button
                  onClick={() => {
                    setIsAddingList(false);
                    setNewListTitle("");
                  }}
                  className="h-8 w-8 rounded hover:bg-black/5 flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-[#42526e]" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-72 shrink-0 h-11 bg-white/20 hover:bg-white/30 transition p-3 rounded-lg flex items-center gap-x-2 text-white font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Add another list
            </button>
          )}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="w-72 bg-white rounded shadow-lg border border-neutral-200 p-2 text-sm text-[#172b4d] opacity-70">
              {activeCard.title}
            </div>
          ) : null}

          {!activeCard && activeList ? (
            <div className="w-72 bg-[#ebecf0] rounded-lg p-2 shadow-lg opacity-70">
              <p className="text-sm font-semibold text-[#172b4d]">{activeList.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedCard ? (
        <CardModal
          cardId={selectedCard.cardId}
          listTitle={selectedCard.listTitle}
          allMembers={members}
          onClose={() => setSelectedCard(null)}
          onCardUpdate={handleCardUpdate}
        />
      ) : null}
    </div>
  );
};
