import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../lib/prisma';

const multer = require('multer') as any;

const router = Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniquePrefix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    cb(null, `${uniquePrefix}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const cardInclude = {
  labels: true,
  members: { include: { member: true } },
  checklists: { include: { items: true } },
  attachments: { orderBy: { createdAt: 'desc' } },
  comments: { orderBy: { createdAt: 'desc' } },
  activities: { orderBy: { createdAt: 'desc' } },
  list: true,
} satisfies Prisma.CardInclude;

const parseId = (value: string): number => Number.parseInt(value, 10);

const getCardById = async (cardId: number) =>
  prisma.card.findUnique({
    where: { id: cardId },
    include: cardInclude,
  });

const createActivity = async (cardId: number, action: string, details?: string) => {
  await prisma.activity.create({
    data: {
      cardId,
      action,
      details: details?.trim() ? details.trim() : null,
    },
  });
};

router.post('/', async (req, res, next) => {
  try {
    const { title, listId } = req.body as { title?: string; listId?: number };

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Card title is required' });
      return;
    }

    if (typeof listId !== 'number' || Number.isNaN(listId)) {
      res.status(400).json({ error: 'Valid listId is required' });
      return;
    }

    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    const lastCard = await prisma.card.findFirst({
      where: { listId, isArchived: false },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = lastCard ? lastCard.position + 1 : 1;

    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        listId,
        position,
      },
      include: cardInclude,
    });

    await createActivity(card.id, 'Card created', `Created in list "${list.title}"`);

    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    const card = await getCardById(cardId);

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    res.json(card);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    const { title, description, dueDate, listId, position, isArchived, coverColor } = req.body as {
      title?: string;
      description?: string | null;
      dueDate?: string | null;
      listId?: number;
      position?: number;
      isArchived?: boolean;
      coverColor?: string | null;
    };

    const data: Prisma.CardUpdateInput = {};
    const activityDetails: string[] = [];

    if (typeof title === 'string') {
      if (!title.trim()) {
        res.status(400).json({ error: 'Card title cannot be empty' });
        return;
      }
      data.title = title.trim();
      activityDetails.push('title changed');
    }

    if (description !== undefined) {
      data.description = description && description.trim() ? description.trim() : null;
      activityDetails.push('description updated');
    }

    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        data.dueDate = null;
      } else {
        const parsedDate = new Date(dueDate);
        if (Number.isNaN(parsedDate.getTime())) {
          res.status(400).json({ error: 'Invalid dueDate' });
          return;
        }
        data.dueDate = parsedDate;
      }

      activityDetails.push('due date updated');
    }

    if (typeof listId === 'number' && !Number.isNaN(listId)) {
      data.list = { connect: { id: listId } };
      activityDetails.push('moved list');
    }

    if (typeof position === 'number' && Number.isFinite(position)) {
      data.position = position;

      if (typeof listId !== 'number') {
        activityDetails.push('reordered within list');
      }
    }

    if (typeof isArchived === 'boolean') {
      data.isArchived = isArchived;

      activityDetails.push(isArchived ? 'archived' : 'unarchived');
    }

    if (coverColor !== undefined) {
      data.coverColor = coverColor && coverColor.trim() ? coverColor.trim() : null;
      activityDetails.push('cover updated');
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const card = await prisma.card.update({
      where: { id: cardId },
      data,
      include: cardInclude,
    });

    if (isArchived === true) {
      await createActivity(cardId, 'Card archived');
    } else if (activityDetails.length > 0) {
      await createActivity(cardId, 'Card updated', activityDetails.join(', '));
    }

    res.json(card);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    await prisma.card.delete({ where: { id: cardId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/labels', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const { color, text } = req.body as { color?: string; text?: string };

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    if (!color || !color.trim()) {
      res.status(400).json({ error: 'Label color is required' });
      return;
    }

    const label = await prisma.label.create({
      data: {
        cardId,
        color: color.trim(),
        text: text?.trim() ?? '',
      },
    });

    await createActivity(cardId, 'Label added', label.text || label.color);

    res.status(201).json(label);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/labels/:labelId', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const labelId = parseId(req.params.labelId);

    if (Number.isNaN(cardId) || Number.isNaN(labelId)) {
      res.status(400).json({ error: 'Invalid id provided' });
      return;
    }

    const existingLabel = await prisma.label.findFirst({
      where: {
        id: labelId,
        cardId,
      },
    });

    if (!existingLabel) {
      res.status(404).json({ error: 'Label not found' });
      return;
    }

    await prisma.label.delete({ where: { id: labelId } });
    await createActivity(cardId, 'Label removed', existingLabel.text || existingLabel.color);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/members', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const { memberId } = req.body as { memberId?: number };

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    if (typeof memberId !== 'number' || Number.isNaN(memberId)) {
      res.status(400).json({ error: 'Valid memberId is required' });
      return;
    }

    await prisma.cardMember.upsert({
      where: {
        cardId_memberId: {
          cardId,
          memberId,
        },
      },
      update: {},
      create: {
        cardId,
        memberId,
      },
    });

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { name: true },
    });

    await createActivity(cardId, 'Member assigned', member?.name || `Member #${memberId}`);

    const card = await getCardById(cardId);
    res.json(card);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/members/:memberId', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const memberId = parseId(req.params.memberId);

    if (Number.isNaN(cardId) || Number.isNaN(memberId)) {
      res.status(400).json({ error: 'Invalid id provided' });
      return;
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { name: true },
    });

    const result = await prisma.cardMember.deleteMany({
      where: {
        cardId,
        memberId,
      },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Member assignment not found' });
      return;
    }

    await createActivity(cardId, 'Member removed', member?.name || `Member #${memberId}`);

    const card = await getCardById(cardId);
    res.json(card);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/checklists', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const { title } = req.body as { title?: string };

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Checklist title is required' });
      return;
    }

    const checklist = await prisma.checklist.create({
      data: {
        cardId,
        title: title.trim(),
      },
      include: {
        items: true,
      },
    });

    await createActivity(cardId, 'Checklist added', checklist.title);

    res.status(201).json(checklist);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/checklists/:checklistId', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const checklistId = parseId(req.params.checklistId);

    if (Number.isNaN(cardId) || Number.isNaN(checklistId)) {
      res.status(400).json({ error: 'Invalid id provided' });
      return;
    }

    const checklist = await prisma.checklist.findFirst({
      where: {
        id: checklistId,
        cardId,
      },
      select: { id: true, title: true },
    });

    if (!checklist) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    await prisma.checklist.delete({ where: { id: checklistId } });
    await createActivity(cardId, 'Checklist removed', checklist.title);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/checklists/:checklistId/items', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const checklistId = parseId(req.params.checklistId);
    const { text } = req.body as { text?: string };

    if (Number.isNaN(cardId) || Number.isNaN(checklistId)) {
      res.status(400).json({ error: 'Invalid id provided' });
      return;
    }

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Checklist item text is required' });
      return;
    }

    const checklist = await prisma.checklist.findFirst({
      where: {
        id: checklistId,
        cardId,
      },
      select: { id: true },
    });

    if (!checklist) {
      res.status(404).json({ error: 'Checklist not found for this card' });
      return;
    }

    const item = await prisma.checklistItem.create({
      data: {
        checklistId,
        text: text.trim(),
      },
    });

    await createActivity(cardId, 'Checklist item added', text.trim());

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/checklists/:checklistId/items/:itemId', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const checklistId = parseId(req.params.checklistId);
    const itemId = parseId(req.params.itemId);
    const { isComplete } = req.body as { isComplete?: boolean };

    if (Number.isNaN(cardId) || Number.isNaN(checklistId) || Number.isNaN(itemId)) {
      res.status(400).json({ error: 'Invalid id provided' });
      return;
    }

    if (typeof isComplete !== 'boolean') {
      res.status(400).json({ error: 'isComplete must be boolean' });
      return;
    }

    const result = await prisma.checklistItem.updateMany({
      where: {
        id: itemId,
        checklistId,
      },
      data: {
        isComplete,
      },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Checklist item not found' });
      return;
    }

    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    await createActivity(cardId, 'Checklist item updated', isComplete ? 'Marked complete' : 'Marked incomplete');

    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/checklists/:checklistId/items/:itemId', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const checklistId = parseId(req.params.checklistId);
    const itemId = parseId(req.params.itemId);

    if (Number.isNaN(cardId) || Number.isNaN(checklistId) || Number.isNaN(itemId)) {
      res.status(400).json({ error: 'Invalid id provided' });
      return;
    }

    const result = await prisma.checklistItem.deleteMany({
      where: {
        id: itemId,
        checklistId,
      },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Checklist item not found' });
      return;
    }

    await createActivity(cardId, 'Checklist item removed');

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/attachments/upload', upload.single('file'), async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const reqWithFile = req as typeof req & {
      file?: {
        filename: string;
        originalname: string;
        size: number;
      };
    };

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    if (!reqWithFile.file) {
      res.status(400).json({ error: 'File is required' });
      return;
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${reqWithFile.file.filename}`;

    const attachment = await prisma.attachment.create({
      data: {
        cardId,
        name: reqWithFile.file.originalname,
        url: fileUrl,
        size: reqWithFile.file.size,
      },
    });

    await createActivity(cardId, 'Attachment uploaded', attachment.name);

    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/attachments', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const { name, url, size } = req.body as { name?: string; url?: string; size?: number };

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    if (!url || !url.trim()) {
      res.status(400).json({ error: 'Attachment URL is required' });
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      res.status(400).json({ error: 'Invalid attachment URL' });
      return;
    }

    const attachment = await prisma.attachment.create({
      data: {
        cardId,
        url: parsedUrl.toString(),
        name: name?.trim() || parsedUrl.hostname,
        size: typeof size === 'number' && Number.isFinite(size) ? Math.max(0, Math.round(size)) : null,
      },
    });

    await createActivity(cardId, 'Attachment added', attachment.name);

    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/attachments/:attachmentId', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const attachmentId = parseId(req.params.attachmentId);

    if (Number.isNaN(cardId) || Number.isNaN(attachmentId)) {
      res.status(400).json({ error: 'Invalid id provided' });
      return;
    }

    const attachment = await prisma.attachment.findFirst({
      where: { id: attachmentId, cardId },
      select: { id: true, name: true },
    });

    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
      return;
    }

    await prisma.attachment.delete({ where: { id: attachment.id } });
    await createActivity(cardId, 'Attachment removed', attachment.name);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comments', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const { text, authorName } = req.body as { text?: string; authorName?: string };

    if (Number.isNaN(cardId)) {
      res.status(400).json({ error: 'Invalid card id' });
      return;
    }

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        cardId,
        text: text.trim(),
        authorName: authorName?.trim() || 'You',
      },
    });

    await createActivity(cardId, 'Comment added', comment.authorName);

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const cardId = parseId(req.params.id);
    const commentId = parseId(req.params.commentId);

    if (Number.isNaN(cardId) || Number.isNaN(commentId)) {
      res.status(400).json({ error: 'Invalid id provided' });
      return;
    }

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, cardId },
      select: { id: true, authorName: true },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    await prisma.comment.delete({ where: { id: comment.id } });
    await createActivity(cardId, 'Comment removed', comment.authorName);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
