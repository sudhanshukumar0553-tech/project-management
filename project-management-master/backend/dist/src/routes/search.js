"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const boardIdRaw = typeof req.query.boardId === 'string' ? req.query.boardId : undefined;
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const labelColor = typeof req.query.labelColor === 'string' ? req.query.labelColor.trim() : '';
        const memberIdRaw = typeof req.query.memberId === 'string' ? req.query.memberId : '';
        const dueDateFilter = typeof req.query.dueDateFilter === 'string'
            ? req.query.dueDateFilter
            : undefined;
        if (!boardIdRaw) {
            res.status(400).json({ error: 'boardId is required' });
            return;
        }
        const boardId = Number.parseInt(boardIdRaw, 10);
        if (Number.isNaN(boardId)) {
            res.status(400).json({ error: 'Invalid boardId' });
            return;
        }
        const where = {
            isArchived: false,
            list: { boardId },
        };
        if (q) {
            where.title = { contains: q, mode: 'insensitive' };
        }
        if (labelColor) {
            where.labels = { some: { color: labelColor } };
        }
        if (memberIdRaw) {
            const memberId = Number.parseInt(memberIdRaw, 10);
            if (Number.isNaN(memberId)) {
                res.status(400).json({ error: 'Invalid memberId' });
                return;
            }
            where.members = { some: { memberId } };
        }
        if (dueDateFilter === 'overdue') {
            where.dueDate = { lt: new Date() };
        }
        else if (dueDateFilter === 'this_week') {
            const start = new Date();
            const end = new Date();
            end.setDate(start.getDate() + 7);
            where.dueDate = { gte: start, lte: end };
        }
        else if (dueDateFilter === 'no_date') {
            where.dueDate = null;
        }
        const cards = await prisma_1.prisma.card.findMany({
            where,
            select: { id: true },
        });
        res.json({ cardIds: cards.map((card) => card.id) });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
