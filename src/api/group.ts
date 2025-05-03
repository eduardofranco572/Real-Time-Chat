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
            
            const io = req.app.get('io');
            io.emit('newGroup', { idChat, nomeGrupo });
            return res.json({ message: 'Grupo criado com sucesso', idChat, idGrupo });
        });
    });
  });
});

router.post('/UpdateGroup', upload.single('imgGrupo'), (req: Request, res: Response) => {
  const { idChat, descricaoGrupo, nomeGrupo } = req.body;

  if (!idChat || (descricaoGrupo == null && nomeGrupo == null && !req.file)) {
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
    if (req.file) payload.imgGrupo = req.file.filename;

    const io = req.app.get('io');
    io.emit('groupUpdated', payload);

    res.json({ message: 'Grupo atualizado com sucesso' });
  });
});

router.post('/getGroupInfo', (req, res) => {
  const { idChat } = req.body;
  if (!idChat) return res.status(400).send({ error: 'idChat é obrigatório' });
  
  const sqlGroup = `
    SELECT idChat AS id,
       nomeGrupo AS nome,
       imgGrupo AS imageUrl,
       descricaoGrupo AS descricao
    FROM grupos
    WHERE idChat = ?
    LIMIT 1
  `;

  const sqlMembers = `
    SELECT u.ID AS id,
           u.nome AS nome,
           u.img AS imageUrl
    FROM chat_participants cp
    JOIN usuario u
      ON cp.idUser = u.ID
    WHERE cp.idChat = ?
  `;

  db.query(sqlGroup, [idChat], (err, groupResults: any[]) => {
    if (err) return res.status(500).send({ error: err.message });

    if (groupResults.length === 0) {
      return res.status(404).send({ error: 'Grupo não encontrado' });
    }

    const group = groupResults[0];
    
    if (!group.descricaoGrupo || group.descricaoGrupo.trim() === '') {
      group.descricaoGrupo = 'Bem vindo(a) ao grupo!';
    }

    group.imageUrl = group.imageUrl
      ? `/upload/grupo/${group.imageUrl}`
      : '/upload/grupo/default.png';

    db.query(sqlMembers, [idChat], (err2, membersResults: any[]) => {
      if (err2) {
        console.error('Erro ao buscar membros do grupo:', err2);
        return res.status(500).send({ error: err2.message });
      }

      const members = membersResults.map(m => ({
        id: m.id,
        nome: m.nome,
        imageUrl: m.imageUrl
          ? `/upload/imagensUser/${m.imageUrl}`
          : '/upload/imagensUser/default.png',
      }));

      res.send({
        message: 'ok',
        group,
        members,
      });
    });
  });
});

router.post('/addParticipant', (req: Request, res: Response) => {
  const { idChat, participantIds } = req.body
  if (!idChat || !participantIds) {
    return res.status(400).json({ error: 'idChat e participantIds são obrigatórios' })
  }

  let ids: number[] = Array.isArray(participantIds)
    ? participantIds.map((i: any) => Number(i))
    : JSON.parse(participantIds).map((i: any) => Number(i))

  ids = ids.filter(id => !isNaN(id))
  if (ids.length === 0) {
    return res.status(400).json({ error: 'Nenhum id de participante válido' })
  }

  const placeholders = ids.map(() => '(?, ?)').join(', ')
  const values = ids.flatMap(id => [idChat, id])

  const sql = `
    INSERT IGNORE INTO chat_participants (idChat, idUser)
    VALUES ${placeholders}
  `
  db.query(sql, values, err => {
    if (err) {
      console.error('Erro ao adicionar participantes:', err)
      return res.status(500).json({ error: 'Erro no banco' })
    }

    const io = req.app.get('io')
    io.emit('groupUpdated', { idChat })
    return res.json({ message: 'Participantes adicionados com sucesso' })
  })
})

router.post('/leaveGroup', (req: Request, res: Response) => {
  const { idChat, idUser } = req.body
  if (!idChat || !idUser) {
    return res.status(400).json({ error: 'idChat e idUser são obrigatórios' })
  }

  const sql = `
    DELETE FROM chat_participants
    WHERE idChat = ? AND idUser = ?
  `
  db.query(sql, [idChat, idUser], (err) => {
    if (err) {
      console.error('Erro ao remover participante:', err)
      return res.status(500).json({ error: 'Erro ao sair do grupo' })
    }

    const io = req.app.get('io')
    io.emit('groupUpdated', { idChat })
    return res.json({ message: 'Saiu do grupo com sucesso' })
  })
})

export default router;
