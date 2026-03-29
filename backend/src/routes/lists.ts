import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

const parseId = (value: string): number => Number.parseInt(value, 10);

router.post('/', async (req, res, next) => {
  try {
    const { title, boardId } = req.body as { title?: string; boardId?: number };

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'List title is required' });
      return;
    }

    if (typeof boardId !== 'number' || Number.isNaN(boardId)) {
      res.status(400).json({ error: 'Valid boardId is required' });
      return;
    }

    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = lastList ? lastList.position + 1 : 1;

    const list = await prisma.list.create({
      data: {
        title: title.trim(),
        boardId,
        position,
      },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: { position: 'asc' },
          include: {
            labels: true,
            members: { include: { member: true } },
            checklists: { include: { items: true } },
          },
        },
      },
    });

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/position', async (req, res, next) => {
  try {
    const listId = parseId(req.params.id);
    const { position } = req.body as { position?: number };

    if (Number.isNaN(listId)) {
      res.status(400).json({ error: 'Invalid list id' });
      return;
    }

    if (typeof position !== 'number' || !Number.isFinite(position)) {
      res.status(400).json({ error: 'Valid position is required' });
      return;
    }

    const list = await prisma.list.update({
      where: { id: listId },
      data: { position },
    });

    res.json(list);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const listId = parseId(req.params.id);
    const { title } = req.body as { title?: string };

    if (Number.isNaN(listId)) {
      res.status(400).json({ error: 'Invalid list id' });
      return;
    }

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'List title is required' });
      return;
    }

    const list = await prisma.list.update({
      where: { id: listId },
      data: { title: title.trim() },
    });

    res.json(list);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const listId = parseId(req.params.id);

    if (Number.isNaN(listId)) {
      res.status(400).json({ error: 'Invalid list id' });
      return;
    }

    await prisma.list.delete({ where: { id: listId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
