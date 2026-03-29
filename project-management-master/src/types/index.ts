export interface Member {
  id: number;
  name: string;
  email: string;
  color: string;
}

export interface Label {
  id: number;
  color: string;
  text: string;
  cardId: number;
}

export interface ChecklistItem {
  id: number;
  text: string;
  isComplete: boolean;
  checklistId: number;
}

export interface Checklist {
  id: number;
  title: string;
  cardId: number;
  items: ChecklistItem[];
}

export interface Attachment {
  id: number;
  name: string;
  url: string;
  size?: number | null;
  cardId: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  text: string;
  authorName: string;
  cardId: number;
  createdAt: string;
}

export interface Activity {
  id: number;
  action: string;
  details?: string | null;
  cardId: number;
  createdAt: string;
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  position: number;
  dueDate?: string;
  isArchived: boolean;
  coverColor?: string;
  listId: number;
  labels: Label[];
  members: { member: Member }[];
  checklists: Checklist[];
  attachments: Attachment[];
  comments: Comment[];
  activities: Activity[];
}

export interface List {
  id: number;
  title: string;
  position: number;
  boardId: number;
  cards: Card[];
}

export interface Board {
  id: number;
  title: string;
  bgColor: string;
  lists: List[];
}
