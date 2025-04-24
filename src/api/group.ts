import express, { Request, Response } from 'express';
import db from '../server/db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = 'upload/grupo';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/addGroup', upload.single('imgGrupo'), (req: Request, res: Response) => {
  const { nomeGrupo, participantIds, idUser } = req.body;
  if (!nomeGrupo || !participantIds || !idUser) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const sqlCreateChat = 'INSERT INTO chats (nomeChat) VALUES (?)';
  db.query(sqlCreateChat, [nomeGrupo], (err1, chatResult: any) => {
    if (err1) return res.status(500).json({ error: 'Erro ao criar chat' });
    const idChat = chatResult.insertId;

    const imgFilename = req.file?.filename || null;
    const sqlInsertGrupo = 'INSERT INTO grupos (nomeGrupo, imgGrupo, idChat) VALUES (?, ?, ?)';

    db.query(sqlInsertGrupo, [nomeGrupo, imgFilename, idChat], (err2, grpResult) => {
        if (err2) {
            console.error('Erro ao inserir na tabela grupo:', err2);
            return res.status(500).json({ error: 'Erro ao criar grupo' });
        }
   
        const idGrupo = grpResult.insertId;
        const allIds = [Number(idUser), ...JSON.parse(participantIds).map((i: string) => Number(i))];
        const values = allIds.flatMap(idUsr => [idChat, idUsr]);
        const sqlInsertParts = `
            INSERT INTO chat_participants (idChat, idUser)
            VALUES ${allIds.map(() => '(?, ?)').join(', ')}
        `;

        db.query(sqlInsertParts, values, err3 => {
            if (err3) return res.status(500).json({ error: 'Erro ao adicionar participantes' });
            return res.json({ message: 'Grupo criado com sucesso', idChat, idGrupo });
        });
    });
  });
});

router.post('/UpdateGroup', upload.single('imgGrupo'), (req: Request, res: Response) => {
  const { idChat, descricaoGrupo, nomeGrupo } = req.body;

  if (!idChat || (descricaoGrupo == null && nomeGrupo == null)) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const updates: string[] = [];
  const params: any[]    = [];

  if (descricaoGrupo != null) {
    updates.push('descricaoGrupo = ?');
    params.push(descricaoGrupo.trim() === '' 
      ? 'Bem vindo(a) ao grupo!'
      : descricaoGrupo);
  }

  if (nomeGrupo != null) {
    updates.push('nomeGrupo = ?');
    params.push(nomeGrupo);
  }
  
  if (req.file) {
    updates.push('imgGrupo = ?');
    params.push(req.file.filename);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nada para atualizar' });
  }

  const sql = `UPDATE grupos SET ${updates.join(', ')} WHERE idChat = ?`;
  params.push(idChat);

  db.query(sql, params, (err) => {
    if (err) {
      console.error('Erro ao atualizar grupo:', err);
      return res.status(500).json({ error: 'Erro ao atualizar grupo' });
    }

    const payload: any = { idChat };
    if (descricaoGrupo != null) payload.descricaoGrupo = descricaoGrupo;
    if (nomeGrupo != null) payload.nomeGrupo = nomeGrupo;

    const io = req.app.get('io');
    io.emit('groupUpdated', payload);

    res.json({ message: 'Grupo atualizado com sucesso' });
  });
});

export default router;
