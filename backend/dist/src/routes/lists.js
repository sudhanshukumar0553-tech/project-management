"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const parseId = (value) => Number.parseInt(value, 10);
router.post('/', async (req, res, next) => {
    try {
        const { title, boardId } = req.body;
        if (!title || !title.trim()) {
            res.status(400).json({ error: 'List title is required' });
            return;
        }
        if (typeof boardId !== 'number' || Number.isNaN(boardId)) {
            res.status(400).json({ error: 'Valid boardId is required' });
            return;
        }
        const lastList = await prisma_1.prisma.list.findFirst({
            where: { boardId },
            orderBy: { position: 'desc' },
            select: { position: true },
        });
        const position = lastList ? lastList.position + 1 : 1;
        const list = await prisma_1.prisma.list.create({
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
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/position', async (req, res, next) => {
    try {
        const listId = parseId(req.params.id);
        const { position } = req.body;
        if (Number.isNaN(listId)) {
            res.status(400).json({ error: 'Invalid list id' });
            return;
        }
        if (typeof position !== 'number' || !Number.isFinite(position)) {
            res.status(400).json({ error: 'Valid position is required' });
            return;
        }
        const list = await prisma_1.prisma.list.update({
            where: { id: listId },
            data: { position },
        });
        res.json(list);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id', async (req, res, next) => {
    try {
        const listId = parseId(req.params.id);
        const { title } = req.body;
        if (Number.isNaN(listId)) {
            res.status(400).json({ error: 'Invalid list id' });
            return;
        }
        if (!title || !title.trim()) {
            res.status(400).json({ error: 'List title is required' });
            return;
        }
        const list = await prisma_1.prisma.list.update({
            where: { id: listId },
            data: { title: title.trim() },
        });
        res.json(list);
    }
    catch (error) {
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
        await prisma_1.prisma.list.delete({ where: { id: listId } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
