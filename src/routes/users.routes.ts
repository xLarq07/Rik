import { Router, Request, Response } from 'express';

export const usersRouter = Router();

// Kullanıcı listeleme
usersRouter.get('/', (_req: Request, res: Response) => {
  res.json([
    { id: 'usr_1', email: 'demo@rik.dev', fullName: 'Demo Kullanıcı', createdAt: new Date().toISOString() }
  ]);
});

// Yeni kullanıcı oluşturma
usersRouter.post('/', (req: Request, res: Response) => {
  const { email, fullName } = req.body ?? {};

  const createdUser = {
    id: `usr_${Date.now()}`,
    email,
    fullName,
    createdAt: new Date().toISOString()
  };

  res.status(201).json(createdUser);
});

// Kullanıcı detayını döndürme
usersRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  res.json({
    id,
    email: 'detail@rik.dev',
    fullName: 'Detay Kullanıcı',
    createdAt: new Date().toISOString()
  });
});
