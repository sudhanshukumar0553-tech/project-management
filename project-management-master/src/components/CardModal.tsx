"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CalendarDays,
  Check,
  CheckSquare,
  Clock3,
  MessageSquare,
  Paperclip,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cardsApi } from "@/lib/api";
import type { Attachment, Card, Checklist, Comment, Member } from "@/types";

interface CardModalProps {
  cardId: number;
  listTitle: string;
  allMembers: Member[];
  onClose: () => void;
  onCardUpdate: (updatedCard: Card) => void;
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

type CardPatchPayload = Partial<{
  title: string;
  description: string | null;
  dueDate: string | null;
  listId: number;
  position: number;
  isArchived: boolean;
  coverColor: string | null;
}>;

const getInitials = (name: string) => {
  const [first, second] = name.trim().split(" ");
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase() || "?";
};

const toInputDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatFullDate = (value?: string) => {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function CardModal({ cardId, listTitle, allMembers, onClose, onCardUpdate }: CardModalProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);

  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showSidebarLabels, setShowSidebarLabels] = useState(false);
  const [showSidebarMembers, setShowSidebarMembers] = useState(false);
  const [showDueDateEditor, setShowDueDateEditor] = useState(false);

  const [selectedLabelColor, setSelectedLabelColor] = useState(LABEL_COLORS[0]);
  const [labelText, setLabelText] = useState("");
  const [dueDone, setDueDone] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("You");

  const [checklistItemInputs, setChecklistItemInputs] = useState<Record<number, string>>({});

  const loadCard = useCallback(async (syncBoard = false) => {
    try {
      setLoading(true);
      const response = await cardsApi.getById(cardId);
      const nextCard = response.data as Card;
      setCard(nextCard);
      setTitleDraft(nextCard.title);
      setDescriptionDraft(nextCard.description ?? "");
      setDueDone(false);
      if (syncBoard) {
        onCardUpdate(nextCard);
      }
      return nextCard;
    } catch (error) {
      console.error("Failed to load card", error);
      setCard(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cardId, onCardUpdate]);

  useEffect(() => {
    void loadCard();
  }, [loadCard]);

  const updateCard = useCallback(
    async (payload: CardPatchPayload) => {
      if (!card) return;

      const response = await cardsApi.update(card.id, payload);
      const updated = response.data as Card;
      setCard(updated);
      setTitleDraft(updated.title);
      setDescriptionDraft(updated.description ?? "");
      onCardUpdate(updated);
    },
    [card, onCardUpdate],
  );

  const assignedMemberIds = useMemo(
    () => new Set(card?.members.map(({ member }) => member.id) ?? []),
    [card?.members],
  );

  const handleTitleBlur = async () => {
    if (!card) return;

    const nextTitle = titleDraft.trim();
    if (!nextTitle || nextTitle === card.title) {
      setTitleDraft(card.title);
      return;
    }

    try {
      await updateCard({ title: nextTitle });
    } catch (error) {
      console.error("Failed to update title", error);
      setTitleDraft(card.title);
    }
  };

  const handleDescriptionSave = async () => {
    if (!card) return;

    try {
      await updateCard({ description: descriptionDraft.trim() || null });
      setEditingDescription(false);
    } catch (error) {
      console.error("Failed to update description", error);
    }
  };

  const handleDueDateChange = async (value: string) => {
    try {
      await updateCard({ dueDate: value || null });
    } catch (error) {
      console.error("Failed to update due date", error);
    }
  };

  const handleAddLabel = async (color: string, text: string) => {
    if (!card) return;

    try {
      await cardsApi.addLabel(card.id, { color, text });
      setLabelText("");
      await loadCard(true);
    } catch (error) {
      console.error("Failed to add label", error);
    }
  };

  const handleRemoveLabel = async (labelId: number) => {
    if (!card) return;

    try {
      await cardsApi.removeLabel(card.id, labelId);
      await loadCard(true);
    } catch (error) {
      console.error("Failed to remove label", error);
    }
  };

  const handleToggleMember = async (memberId: number) => {
    if (!card) return;

    try {
      if (assignedMemberIds.has(memberId)) {
        await cardsApi.removeMember(card.id, memberId);
      } else {
        await cardsApi.addMember(card.id, memberId);
      }
      await loadCard(true);
    } catch (error) {
      console.error("Failed to toggle member", error);
    }
  };

  const handleAddChecklist = async () => {
    if (!card) return;

    const title = window.prompt("Checklist title");
    if (!title?.trim()) return;

    try {
      await cardsApi.addChecklist(card.id, title.trim());
      await loadCard(true);
    } catch (error) {
      console.error("Failed to add checklist", error);
    }
  };

  const handleDeleteChecklist = async (checklistId: number) => {
    if (!card) return;

    try {
      await cardsApi.deleteChecklist(card.id, checklistId);
      await loadCard(true);
    } catch (error) {
      console.error("Failed to delete checklist", error);
    }
  };

  const handleAddChecklistItem = async (checklistId: number) => {
    if (!card) return;

    const text = checklistItemInputs[checklistId]?.trim();
    if (!text) return;

    try {
      await cardsApi.addChecklistItem(card.id, checklistId, text);
      setChecklistItemInputs((prev) => ({ ...prev, [checklistId]: "" }));
      await loadCard(true);
    } catch (error) {
      console.error("Failed to add checklist item", error);
    }
  };

  const handleToggleChecklistItem = async (
    checklistId: number,
    itemId: number,
    isComplete: boolean,
  ) => {
    if (!card) return;

    try {
      await cardsApi.toggleChecklistItem(card.id, checklistId, itemId, isComplete);
      await loadCard(true);
    } catch (error) {
      console.error("Failed to update checklist item", error);
    }
  };

  const handleDeleteChecklistItem = async (checklistId: number, itemId: number) => {
    if (!card) return;

    try {
      await cardsApi.deleteChecklistItem(card.id, checklistId, itemId);
      await loadCard(true);
    } catch (error) {
      console.error("Failed to delete checklist item", error);
    }
  };

  const handleAddAttachment = async () => {
    if (!card) return;

    const url = attachmentUrl.trim();
    if (!url) return;

    try {
      await cardsApi.addAttachment(card.id, {
        name: attachmentName.trim() || undefined,
        url,
      });
      setAttachmentName("");
      setAttachmentUrl("");
      await loadCard(true);
    } catch (error) {
      console.error("Failed to add attachment", error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!card) return;

    try {
      await cardsApi.removeAttachment(card.id, attachmentId);
      await loadCard(true);
    } catch (error) {
      console.error("Failed to remove attachment", error);
    }
  };

  const handleUploadAttachment = async () => {
    if (!card || !attachmentFile) return;

    try {
      await cardsApi.uploadAttachment(card.id, attachmentFile);
      setAttachmentFile(null);
      await loadCard(true);
    } catch (error) {
      console.error("Failed to upload attachment", error);
    }
  };

  const handleAddComment = async () => {
    if (!card) return;

    const text = commentText.trim();
    if (!text) return;

    try {
      await cardsApi.addComment(card.id, {
        text,
        authorName: authorName.trim() || "You",
      });
      setCommentText("");
      await loadCard(true);
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!card) return;

    try {
      await cardsApi.removeComment(card.id, comment.id);
      await loadCard(true);
    } catch (error) {
      console.error("Failed to remove comment", error);
    }
  };

  const handleArchive = async () => {
    try {
      await updateCard({ isArchived: true });
      onClose();
    } catch (error) {
      console.error("Failed to archive card", error);
    }
  };

  const handleDelete = async () => {
    if (!card) return;

    try {
      await cardsApi.delete(card.id);
      onCardUpdate({ ...card, isArchived: true });
      onClose();
    } catch (error) {
      console.error("Failed to delete card", error);
    }
  };

  const renderChecklist = (checklist: Checklist) => {
    const total = checklist.items.length;
    const done = checklist.items.filter((item) => item.isComplete).length;
    const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

    return (
      <div key={checklist.id} className="rounded-md bg-white p-3 border border-neutral-200">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-[#172b4d]">{checklist.title}</h4>
          <button
            onClick={() => void handleDeleteChecklist(checklist.id)}
            className="text-[#5e6c84] hover:text-rose-600"
            title="Delete checklist"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-[#5e6c84] min-w-10">{percentage}%</span>
          <div className="h-2 flex-1 rounded bg-neutral-200 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {checklist.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 bg-neutral-50 rounded px-2 py-1.5">
              <input
                type="checkbox"
                checked={item.isComplete}
                onChange={(event) =>
                  void handleToggleChecklistItem(checklist.id, item.id, event.target.checked)
                }
              />
              <span className={`text-sm flex-1 ${item.isComplete ? "line-through text-neutral-400" : ""}`}>
                {item.text}
              </span>
              <button
                onClick={() => void handleDeleteChecklistItem(checklist.id, item.id)}
                className="text-[#5e6c84] hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={checklistItemInputs[checklist.id] ?? ""}
            onChange={(event) =>
              setChecklistItemInputs((prev) => ({
                ...prev,
                [checklist.id]: event.target.value,
              }))
            }
            placeholder="Add an item"
            className="h-9 flex-1 rounded border border-neutral-300 px-2 text-sm outline-none focus:border-[#0079bf]"
          />
          <button
            onClick={() => void handleAddChecklistItem(checklist.id)}
            className="h-9 px-3 rounded bg-[#0079bf] text-white text-sm hover:bg-[#026aa7]"
          >
            Add
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 p-4"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div
        className="max-w-2xl w-full mx-auto mt-16 bg-[#ebecf0] rounded-lg p-6 max-h-[85vh] overflow-y-auto relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-black/10 flex items-center justify-center"
        >
          <X className="h-5 w-5 text-[#42526e]" />
        </button>

        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-[#0079bf]/30 border-t-[#0079bf] animate-spin" />
          </div>
        ) : !card ? (
          <div className="p-6 text-[#172b4d]">Unable to load this card.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
            <div className="space-y-5">
              <textarea
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={() => void handleTitleBlur()}
                rows={1}
                className="w-full text-2xl font-semibold text-[#172b4d] bg-transparent resize-none outline-none border border-transparent hover:border-neutral-300 focus:border-[#0079bf] rounded px-2 py-1"
              />

              <p className="text-sm text-[#5e6c84] px-2">In list: {listTitle}</p>

              <section className="px-2">
                <h3 className="text-xs uppercase font-semibold tracking-wide text-[#5e6c84] mb-2">Labels</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {card.labels.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.text || "Label"}
                      {showLabelEditor ? (
                        <button onClick={() => void handleRemoveLabel(label.id)}>
                          <X className="h-3 w-3" />
                        </button>
                      ) : null}
                    </span>
                  ))}
                  <button
                    onClick={() => setShowLabelEditor((prev) => !prev)}
                    className="h-8 px-2 rounded bg-white hover:bg-neutral-100 text-sm text-[#172b4d]"
                  >
                    Edit Labels
                  </button>
                </div>

                {showLabelEditor ? (
                  <div className="mt-3 rounded-md bg-white p-3 border border-neutral-200 space-y-3">
                    <div className="grid grid-cols-5 gap-2">
                      {LABEL_COLORS.map((color) => (
                        <button
                          key={color}
                          className="h-8 rounded"
                          style={{
                            backgroundColor: color,
                            outline: selectedLabelColor === color ? "2px solid #172b4d" : "none",
                          }}
                          onClick={() => setSelectedLabelColor(color)}
                        />
                      ))}
                    </div>
                    <input
                      value={labelText}
                      onChange={(event) => setLabelText(event.target.value)}
                      placeholder="Label text"
                      className="w-full h-9 rounded border border-neutral-300 px-2 text-sm outline-none focus:border-[#0079bf]"
                    />
                    <button
                      onClick={() => void handleAddLabel(selectedLabelColor, labelText)}
                      className="h-9 px-3 rounded bg-[#0079bf] text-white text-sm hover:bg-[#026aa7]"
                    >
                      Add label
                    </button>
                  </div>
                ) : null}
              </section>

              <section className="px-2">
                <h3 className="text-xs uppercase font-semibold tracking-wide text-[#5e6c84] mb-2">Members</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {card.members.map(({ member }) => (
                    <span
                      key={member.id}
                      className="h-8 w-8 rounded-full text-white text-xs font-semibold flex items-center justify-center"
                      style={{ backgroundColor: member.color }}
                      title={member.name}
                    >
                      {getInitials(member.name)}
                    </span>
                  ))}
                  <button
                    onClick={() => setShowMemberPicker((prev) => !prev)}
                    className="h-8 px-2 rounded bg-white hover:bg-neutral-100 text-sm text-[#172b4d]"
                  >
                    Assign
                  </button>
                </div>

                {showMemberPicker ? (
                  <div className="mt-3 rounded-md bg-white p-2 border border-neutral-200 max-h-52 overflow-y-auto">
                    {allMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => void handleToggleMember(member.id)}
                        className="w-full px-2 py-2 rounded hover:bg-neutral-100 text-left flex items-center gap-2"
                      >
                        <span
                          className="h-7 w-7 rounded-full text-white text-xs font-semibold flex items-center justify-center"
                          style={{ backgroundColor: member.color }}
                        >
                          {getInitials(member.name)}
                        </span>
                        <span className="text-sm text-[#172b4d] flex-1">{member.name}</span>
                        {assignedMemberIds.has(member.id) ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="px-2">
                <h3 className="text-xs uppercase font-semibold tracking-wide text-[#5e6c84] mb-2">Due Date</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-[#172b4d]">{formatFullDate(card.dueDate)}</span>
                  <button
                    onClick={() => setShowDueDateEditor((prev) => !prev)}
                    className="h-8 px-2 rounded bg-white hover:bg-neutral-100 text-sm text-[#172b4d]"
                  >
                    Edit
                  </button>
                </div>

                {showDueDateEditor ? (
                  <div className="mt-2 rounded-md bg-white p-3 border border-neutral-200 space-y-2">
                    <input
                      type="date"
                      value={toInputDate(card.dueDate)}
                      onChange={(event) => void handleDueDateChange(event.target.value)}
                      className="h-9 rounded border border-neutral-300 px-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-sm text-[#172b4d]">
                      <input
                        type="checkbox"
                        checked={dueDone}
                        onChange={(event) => setDueDone(event.target.checked)}
                      />
                      Mark due date as done
                    </label>
                  </div>
                ) : null}
              </section>

              <section className="px-2">
                <h3 className="text-sm font-semibold text-[#172b4d] mb-2">Description</h3>
                {editingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={descriptionDraft}
                      onChange={(event) => setDescriptionDraft(event.target.value)}
                      rows={4}
                      className="w-full rounded border border-neutral-300 p-2 text-sm outline-none focus:border-[#0079bf]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => void handleDescriptionSave()}
                        className="h-9 px-3 rounded bg-[#0079bf] text-white text-sm hover:bg-[#026aa7]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setDescriptionDraft(card.description ?? "");
                          setEditingDescription(false);
                        }}
                        className="h-9 px-3 rounded bg-neutral-200 text-[#172b4d] text-sm hover:bg-neutral-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingDescription(true)}
                    className="w-full min-h-16 rounded bg-white border border-neutral-200 px-3 py-2 text-left text-sm text-[#172b4d] hover:bg-neutral-50"
                  >
                    {card.description || "Add a more detailed description..."}
                  </button>
                )}
              </section>

              <section className="px-2">
                <h3 className="text-sm font-semibold text-[#172b4d] mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments
                </h3>

                {card.attachments.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {card.attachments.map((attachment: Attachment) => (
                      <div
                        key={attachment.id}
                        className="rounded-md bg-white border border-neutral-200 px-3 py-2 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-[#0052cc] hover:underline break-all"
                          >
                            {attachment.name}
                          </a>
                          <p className="text-xs text-[#5e6c84] mt-0.5">{formatDateTime(attachment.createdAt)}</p>
                        </div>

                        <button
                          onClick={() => void handleDeleteAttachment(attachment.id)}
                          className="text-[#5e6c84] hover:text-rose-600"
                          title="Remove attachment"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#5e6c84] mb-3">No attachments yet.</p>
                )}

                <div className="rounded-md bg-white border border-neutral-200 p-3 space-y-2">
                  <input
                    value={attachmentName}
                    onChange={(event) => setAttachmentName(event.target.value)}
                    placeholder="Attachment name (optional)"
                    className="w-full h-9 rounded border border-neutral-300 px-2 text-sm outline-none focus:border-[#0079bf]"
                  />
                  <input
                    value={attachmentUrl}
                    onChange={(event) => setAttachmentUrl(event.target.value)}
                    placeholder="https://example.com/file"
                    className="w-full h-9 rounded border border-neutral-300 px-2 text-sm outline-none focus:border-[#0079bf]"
                  />
                  <button
                    onClick={() => void handleAddAttachment()}
                    className="h-9 px-3 rounded bg-[#0079bf] text-white text-sm hover:bg-[#026aa7]"
                  >
                    Add by URL
                  </button>

                  <div className="h-px bg-neutral-200 my-1" />

                  <input
                    type="file"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0] ?? null;
                      setAttachmentFile(nextFile);
                    }}
                    className="text-sm"
                  />

                  {attachmentFile ? (
                    <p className="text-xs text-[#5e6c84]">Selected: {attachmentFile.name}</p>
                  ) : null}

                  <button
                    onClick={() => void handleUploadAttachment()}
                    disabled={!attachmentFile}
                    className="h-9 px-3 rounded bg-[#172b4d] text-white text-sm hover:bg-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload file
                  </button>
                </div>
              </section>

              <section className="px-2">
                <h3 className="text-sm font-semibold text-[#172b4d] mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </h3>

                <div className="rounded-md bg-white border border-neutral-200 p-3 space-y-2 mb-3">
                  <input
                    value={authorName}
                    onChange={(event) => setAuthorName(event.target.value)}
                    placeholder="Your name"
                    className="w-full h-9 rounded border border-neutral-300 px-2 text-sm outline-none focus:border-[#0079bf]"
                  />
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    rows={3}
                    placeholder="Write a comment..."
                    className="w-full rounded border border-neutral-300 p-2 text-sm outline-none focus:border-[#0079bf]"
                  />
                  <button
                    onClick={() => void handleAddComment()}
                    className="h-9 px-3 rounded bg-[#0079bf] text-white text-sm hover:bg-[#026aa7]"
                  >
                    Add comment
                  </button>
                </div>

                {card.comments.length > 0 ? (
                  <div className="space-y-2">
                    {card.comments.map((comment: Comment) => (
                      <div key={comment.id} className="rounded-md bg-white border border-neutral-200 px-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-[#172b4d]">{comment.authorName}</p>
                            <p className="text-xs text-[#5e6c84]">{formatDateTime(comment.createdAt)}</p>
                          </div>

                          <button
                            onClick={() => void handleDeleteComment(comment)}
                            className="text-[#5e6c84] hover:text-rose-600"
                            title="Delete comment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-[#172b4d] mt-1 whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#5e6c84]">No comments yet.</p>
                )}
              </section>

              <section className="px-2">
                <h3 className="text-sm font-semibold text-[#172b4d] mb-2 flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  Activity
                </h3>

                {card.activities.length > 0 ? (
                  <div className="space-y-2">
                    {card.activities.map((activity) => (
                      <div key={activity.id} className="rounded-md bg-white border border-neutral-200 px-3 py-2">
                        <p className="text-sm font-medium text-[#172b4d]">{activity.action}</p>
                        {activity.details ? (
                          <p className="text-sm text-[#42526e] mt-0.5">{activity.details}</p>
                        ) : null}
                        <p className="text-xs text-[#5e6c84] mt-1">{formatDateTime(activity.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#5e6c84]">No activity yet.</p>
                )}
              </section>

              <section className="px-2">
                <h3 className="text-sm font-semibold text-[#172b4d] mb-2">Checklist</h3>
                <div className="space-y-3">
                  {card.checklists.map((checklist) => renderChecklist(checklist))}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <div>
                <h3 className="text-xs uppercase font-semibold tracking-wide text-[#5e6c84] mb-2">Add to card</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowSidebarLabels((prev) => !prev)}
                    className="w-full h-9 rounded bg-white border border-neutral-200 px-3 text-left text-sm text-[#172b4d] hover:bg-neutral-100 flex items-center gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    Labels
                  </button>

                  <button
                    onClick={() => setShowSidebarMembers((prev) => !prev)}
                    className="w-full h-9 rounded bg-white border border-neutral-200 px-3 text-left text-sm text-[#172b4d] hover:bg-neutral-100 flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Members
                  </button>

                  <button
                    onClick={() => void handleAddChecklist()}
                    className="w-full h-9 rounded bg-white border border-neutral-200 px-3 text-left text-sm text-[#172b4d] hover:bg-neutral-100 flex items-center gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Checklist
                  </button>

                  <button
                    onClick={() => setShowDueDateEditor((prev) => !prev)}
                    className="w-full h-9 rounded bg-white border border-neutral-200 px-3 text-left text-sm text-[#172b4d] hover:bg-neutral-100 flex items-center gap-2"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Due Date
                  </button>
                </div>

                {showSidebarLabels ? (
                  <div className="mt-2 rounded-md bg-white p-2 border border-neutral-200">
                    <div className="grid grid-cols-5 gap-1">
                      {LABEL_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => void handleAddLabel(color, "")}
                          className="h-7 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {showSidebarMembers ? (
                  <div className="mt-2 rounded-md bg-white p-2 border border-neutral-200 max-h-52 overflow-y-auto">
                    {allMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => void handleToggleMember(member.id)}
                        className="w-full px-2 py-2 rounded hover:bg-neutral-100 text-left text-sm text-[#172b4d]"
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <h3 className="text-xs uppercase font-semibold tracking-wide text-[#5e6c84] mb-2">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => void handleArchive()}
                    className="w-full h-9 rounded bg-white border border-neutral-200 px-3 text-left text-sm text-[#172b4d] hover:bg-neutral-100 flex items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </button>

                  <button
                    onClick={() => void handleDelete()}
                    className="w-full h-9 rounded bg-rose-600 px-3 text-left text-sm text-white hover:bg-rose-700 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
