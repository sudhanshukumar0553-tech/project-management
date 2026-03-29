import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  if (typeof err?.status === 'number') {
    res.status(err.status).json({ error: err.message ?? 'Request failed' });
    return;
  }

  if (err?.code === 'P2025') {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
};
