import express, { Request, Response } from 'express';
import db from '../server/db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const storageChat = multer.diskStorage({
  destination(req, _file, cb) {
    const idUser = req.body.idUser;
    if (!idUser) {
      return cb(new Error("idUser é obrigatório para upload de mídia."), "");
    }
    const userFolder = path.join('upload/imagensChat', idUser.toString());
    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
    cb(null, userFolder);
  },
  filename(_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadChat = multer({
  storage: storageChat,
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens e vídeos são permitidos!'));
    }
  }
});

const storageDocs = multer.diskStorage({
  destination(req, _file, cb) {
    const idUser = req.body.idUser;
    if (!idUser) {
      return cb(new Error("idUser é obrigatório para upload de documentos."), "");
    }
    const userFolder = path.join('upload/documentos', idUser.toString());
    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
    cb(null, userFolder);
  },
  filename(_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadDocs = multer({
  storage: storageDocs,
  fileFilter(_req, file, cb) {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas documentos são permitidos!'));
    }
  }
});

const isLink = (text: string): boolean =>
  text.startsWith('http://') || text.startsWith('https://') || text.includes('.com');

// --- ENDPOINTS ---

router.post('/salvarMensagem', (req: Request, res: Response) => {
  const { idChat, idUser, message, replyTo } = req.body;
  if (!idChat || !idUser || !message) {
    return res.status(400).send({ error: 'Dados incompletos' });
  }
  const linkFlag = isLink(message);
  const replyValue = replyTo && replyTo !== 0 ? replyTo : null;

  const sqlInsert = `
    INSERT INTO chat_messages (idChat, idUser, mensagem, link, replyTo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sqlInsert, [idChat, idUser, message, linkFlag, replyValue], (err, result: any) => {
    if (err) {
      console.error('Erro ao salvar a mensagem:', err);
      return res.status(500).send({ error: 'Erro ao salvar a mensagem' });
    }

    const newMessageBase = {
      id: result.insertId,
      idChat,
      idUser,
      mensagem: message,
      link: linkFlag,
      replyTo: replyValue,
      createdAt: new Date().toISOString()
    };

    const sqlNome = `
      SELECT nome
      FROM usuario
      WHERE id = ?
    `;

    db.query(sqlNome, [idUser], (err2, rows: any[]) => {
      const nomeContato = !err2 && rows.length > 0 ? rows[0].nome : 'Desconhecido';
      const newMessage = { ...newMessageBase, nomeContato };
      const io = req.app.get('io');
      io.emit('newMessage', newMessage);
      res.send({ message: 'Mensagem enviada com sucesso', id: result.insertId });
    });
  });
});

router.post('/getMessages', (req, res) => {
  const { idChat } = req.body;
  const sql = `
    SELECT M.*, U.nome AS nomeContato
    FROM chat_messages M
    JOIN usuario U ON U.id = M.idUser
    WHERE M.idChat = ?
    ORDER BY M.id ASC
  `;

  db.query(sql, [idChat], (err, results: any[]) => {
    if (err) return res.status(500).send({ error: 'Erro ao buscar mensagens' });
    res.send({ messages: results });
  });
});

router.post('/getChatInfo', (req: Request, res: Response) => {
  const { idChat, idUser } = req.body;
  if (!idChat || !idUser) {
    return res.status(400).send({ error: 'idChat e idUser são obrigatórios' });
  }

  const sql = `
    SELECT U.nome, U.email, U.descricao, U.img AS imageFilename, cp.idUser AS contatoId
    FROM chat_participants cp
    JOIN chat_participants cp2
      ON cp2.idChat = cp.idChat AND cp2.idUser = ?
    JOIN usuario U
      ON U.id = cp.idUser
    WHERE cp.idChat = ? 
      AND cp.idUser != ?
    LIMIT 1
  `;

  db.query(sql, [idUser, idChat, idUser], (err, results: any[]) => {
    if (err) {
      console.error('Erro ao buscar info do chat:', err);
      return res.status(500).send({ error: 'Erro ao buscar info do chat' });
    }

    if (results.length === 0) {
      return res.status(404).send({ error: 'Chat não encontrado ou sem outro participante' });
    }

    const row = results[0];
    res.send({
      message: 'ok',
      nome: row.nome,
      email: row.email,
      descricao: row.descricao,
      imageUrl: row.imageFilename ? `/upload/imagensUser/${row.imageFilename}` : '',
      nomeContato: row.nome,
      id: row.contatoId,
    });
  });
});

router.delete('/excluirMensagem', (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) return res.status(400).send({ error: 'ID da mensagem não fornecido' });

  const sqlSelect = 'SELECT mediaUrl FROM chat_messages WHERE id = ?';
  db.query(sqlSelect, [id], (err, results: any[]) => {
    if (err) {
      console.error('Erro ao buscar a mensagem:', err);
      return res.status(500).send({ error: 'Erro ao buscar a mensagem para exclusão' });
    }

    if (results.length === 0) {
      return res.status(404).send({ error: 'Mensagem não encontrada' });
    }

    const mediaUrl = results[0].mediaUrl;
    const sqlDelete = 'DELETE FROM chat_messages WHERE id = ?';
    db.query(sqlDelete, [id], (err2) => {
      if (err2) {
        console.error('Erro ao excluir a mensagem do banco:', err2);
        return res.status(500).send({ error: 'Erro ao excluir a mensagem' });
      }
      
      if (mediaUrl) {
        const filePath = join(__dirname, '../../', mediaUrl);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, unlinkErr => {
            if (unlinkErr) console.error('Erro ao excluir arquivo:', unlinkErr);
          });
        }
      }

      const io = req.app.get('io');
      io.emit('messageDeleted', { id });
      res.send({ message: 'Mensagem e mídia excluídas com sucesso' });
    });
  });
});


router.put('/editarMensagem', (req: Request, res: Response) => {
  const { id, message } = req.body;
  if (!id || !message) {
    return res.status(400).send({ error: 'Dados incompletos' });
  }
  const sql = 'UPDATE chat_messages SET mensagem = ? WHERE id = ?';

  db.query(sql, [message, id], err => {
    if (err) {
      console.error('Erro ao atualizar a mensagem:', err);
      return res.status(500).send({ error: 'Erro ao atualizar a mensagem' });
    }

    const io = req.app.get('io');
    io.emit('messageUpdated', { id, message });
    res.send({ message: 'Mensagem atualizada com sucesso' });
  });
});

router.post('/salvarMensagemMedia', uploadChat.single('mediaChat'), (req, res) => {
  const idChat = parseInt(req.body.idChat, 10);
  const idUser = parseInt(req.body.idUser, 10);
  const message = req.body.message as string;
  const replyTo = req.body.replyTo ? parseInt(req.body.replyTo, 10) : null;
  if (!idChat || !idUser) {
    return res.status(400).send({ error: 'Dados incompletos' });
  }
  const mediaPath = req.file?.path ?? null;
  const linkFlag = !!message && isLink(message);

  const sql = `
    INSERT INTO chat_messages (idChat, idUser, mensagem, link, replyTo, mediaUrl)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [idChat, idUser, message, linkFlag, replyTo, mediaPath], (err, result: any) => {
    if (err) {
      console.error('Erro ao salvar a mensagem:', err);
      return res.status(500).send({ error: 'Erro ao salvar a mensagem' });
    }
    const newMessageBase = {
      id: result.insertId,
      idChat,
      idUser,
      mensagem: message,
      link: linkFlag,
      replyTo,
      mediaUrl: mediaPath,
      createdAt: new Date().toISOString()
    };

    db.query(`SELECT nome FROM usuario WHERE id = ?`, [idUser], (err2, rows: any[]) => {
      const nomeContato = !err2 && rows.length > 0 ? rows[0].nome : 'Desconhecido';
      const newMessage = { ...newMessageBase, nomeContato };
      const io = req.app.get('io');
      io.emit('newMessage', newMessage);
      res.send({ message: 'Mensagem enviada com sucesso', id: result.insertId });
    });
  });
});

router.post('/salvarDocument', uploadDocs.single('mediaChat'), (req, res) => {
  const idChat = parseInt(req.body.idChat, 10);
  const idUser = parseInt(req.body.idUser, 10);
  const message = req.body.message as string;
  const replyTo = req.body.replyTo ? parseInt(req.body.replyTo, 10) : null;
  if (!idChat || !idUser) {
    return res.status(400).send({ error: 'Dados incompletos' });
  }
  const documentPath = req.file?.path ?? null;
  const nomeDocs = req.file?.originalname ?? null;
  const linkFlag = !!message && isLink(message);

  const sql = `
    INSERT INTO chat_messages (idChat, idUser, mensagem, link, replyTo, mediaUrl, nomeDocs)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [idChat, idUser, message, linkFlag, replyTo, documentPath, nomeDocs], (err, result: any) => {
    if (err) {
      console.error('Erro ao salvar o documento:', err);
      return res.status(500).send({ error: 'Erro ao salvar o documento' });
    }
    const newMessageBase = {
      id: result.insertId,
      idChat,
      idUser,
      mensagem: message,
      link: linkFlag,
      replyTo,
      mediaUrl: documentPath,
      nomeDocs,
      createdAt: new Date().toISOString()
    };

    db.query(`SELECT nome FROM usuario WHERE id = ?`, [idUser], (err2, rows: any[]) => {
      const nomeContato = !err2 && rows.length > 0 ? rows[0].nome : 'Desconhecido';
      const newMessage = { ...newMessageBase, nomeContato };
      const io = req.app.get('io');
      io.emit('newMessage', newMessage);
      res.send({ message: 'Documento enviado com sucesso', id: result.insertId });
    });
  });
});

export default router;
