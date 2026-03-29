import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const members = await prisma.member.findMany({ orderBy: { name: 'asc' } });
    res.json(members);
  } catch (error) {
    next(error);
  }
});

export default router;
