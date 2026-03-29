import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

export const boardsApi = {
  getAll: () => api.get('/boards'),
  getById: (id: number) => api.get(`/boards/${id}`),
  create: (data: { title: string; bgColor?: string }) => api.post('/boards', data),
  update: (id: number, data: { title?: string; bgColor?: string }) => api.patch(`/boards/${id}`, data),
  delete: (id: number) => api.delete(`/boards/${id}`),
};

export const listsApi = {
  create: (data: { title: string; boardId: number }) => api.post('/lists', data),
  update: (id: number, data: { title?: string }) => api.patch(`/lists/${id}`, data),
  updatePosition: (id: number, position: number) => api.patch(`/lists/${id}/position`, { position }),
  delete: (id: number) => api.delete(`/lists/${id}`),
};

export const cardsApi = {
  create: (data: { title: string; listId: number }) => api.post('/cards', data),
  getById: (id: number) => api.get(`/cards/${id}`),
  update: (id: number, data: Partial<CardUpdatePayload>) => api.patch(`/cards/${id}`, data),
  delete: (id: number) => api.delete(`/cards/${id}`),
  addLabel: (id: number, data: { color: string; text: string }) => api.post(`/cards/${id}/labels`, data),
  removeLabel: (id: number, labelId: number) => api.delete(`/cards/${id}/labels/${labelId}`),
  addMember: (id: number, memberId: number) => api.post(`/cards/${id}/members`, { memberId }),
  removeMember: (id: number, memberId: number) => api.delete(`/cards/${id}/members/${memberId}`),
  addChecklist: (id: number, title: string) => api.post(`/cards/${id}/checklists`, { title }),
  deleteChecklist: (id: number, checklistId: number) => api.delete(`/cards/${id}/checklists/${checklistId}`),
  addChecklistItem: (id: number, checklistId: number, text: string) =>
    api.post(`/cards/${id}/checklists/${checklistId}/items`, { text }),
  toggleChecklistItem: (id: number, checklistId: number, itemId: number, isComplete: boolean) =>
    api.patch(`/cards/${id}/checklists/${checklistId}/items/${itemId}`, { isComplete }),
  deleteChecklistItem: (id: number, checklistId: number, itemId: number) =>
    api.delete(`/cards/${id}/checklists/${checklistId}/items/${itemId}`),
  addAttachment: (id: number, data: { name?: string; url: string; size?: number }) =>
    api.post(`/cards/${id}/attachments`, data),
  uploadAttachment: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/cards/${id}/attachments/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeAttachment: (id: number, attachmentId: number) =>
    api.delete(`/cards/${id}/attachments/${attachmentId}`),
  addComment: (id: number, data: { text: string; authorName?: string }) =>
    api.post(`/cards/${id}/comments`, data),
  removeComment: (id: number, commentId: number) =>
    api.delete(`/cards/${id}/comments/${commentId}`),
};

export const membersApi = { getAll: () => api.get('/members') };
export const searchApi = (params: object) => api.get('/search', { params });

interface CardUpdatePayload {
  title: string;
  description: string | null;
  dueDate: string | null;
  listId: number;
  position: number;
  isArchived: boolean;
  coverColor: string | null;
}

export default api;
