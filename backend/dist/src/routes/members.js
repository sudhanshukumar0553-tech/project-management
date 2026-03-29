"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (_req, res, next) => {
    try {
        const members = await prisma_1.prisma.member.findMany({ orderBy: { name: 'asc' } });
        res.json(members);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
