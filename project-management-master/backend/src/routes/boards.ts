import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const router = Router();

const boardDetailInclude = {
  lists: {
    orderBy: { position: 'asc' },
    include: {
      cards: {
        where: { isArchived: false },
        orderBy: { position: 'asc' },
        include: {
          labels: true,
          members: { include: { member: true } },
          checklists: { include: { items: true } },
          attachments: { orderBy: { createdAt: 'desc' } },
          comments: { orderBy: { createdAt: 'desc' } },
          activities: { orderBy: { createdAt: 'desc' } },
        },
      },
    },
  },
} satisfies Prisma.BoardInclude;

const parseId = (value: string): number => Number.parseInt(value, 10);

router.get('/', async (_req, res, next) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        bgColor: true,
        bgImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(boards);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, bgColor, bgImage } = req.body as {
      title?: string;
      bgColor?: string;
      bgImage?: string | null;
    };

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Board title is required' });
      return;
    }

    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        bgColor: bgColor?.trim() || '#0079bf',
        bgImage: bgImage ?? null,
      },
    });

    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const boardId = parseId(req.params.id);

    if (Number.isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board id' });
      return;
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: boardDetailInclude,
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    res.json(board);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const boardId = parseId(req.params.id);

    if (Number.isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board id' });
      return;
    }

    const { title, bgColor, bgImage } = req.body as {
      title?: string;
      bgColor?: string;
      bgImage?: string | null;
    };

    const data: Prisma.BoardUpdateInput = {};

    if (typeof title === 'string') {
      if (!title.trim()) {
        res.status(400).json({ error: 'Board title cannot be empty' });
        return;
      }
      data.title = title.trim();
    }

    if (typeof bgColor === 'string' && bgColor.trim()) {
      data.bgColor = bgColor.trim();
    }

    if (bgImage !== undefined) {
      data.bgImage = bgImage && bgImage.trim() ? bgImage.trim() : null;
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data,
    });

    res.json(updatedBoard);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const boardId = parseId(req.params.id);

    if (Number.isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board id' });
      return;
    }

    await prisma.board.delete({ where: { id: boardId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
