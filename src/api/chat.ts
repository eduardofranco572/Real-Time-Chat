import express, { Request, Response } from 'express';
import db from '../server/db'; 

const router = express.Router();

router.post('/salvarMensagem', (req: Request, res: Response) => {
  const { idUser, idContato, message, replyTo } = req.body;
  
  if (!idUser || !idContato || !message) {
    return res.status(400).send({ error: 'Dados incompletos' });
  }
  
  const linkFlag = isLink(message);

  const sql = `
    INSERT INTO chat (idUser, idContato, mensagem, link, replyTo)
    VALUES (?, ?, ?, ?, ?)
  `;
  const replyValue = replyTo !== undefined ? replyTo : null;
  
  db.query(sql, [idUser, idContato, message, linkFlag, replyValue], (err, result) => {
    if (err) {
      console.error('Erro ao salvar a mensagem: ', err);
      return res.status(500).send({ error: 'Erro ao salvar a mensagem' });
    }
    
    const newMessage = {
      id: result.insertId,
      idUser,
      idContato,
      mensagem: message,
      link: linkFlag,
      replyTo: replyValue,
      createdAt: new Date().toISOString(),
    };

    const io = req.app.get('io');
    io.emit('newMessage', newMessage);

    res.send({ message: 'Mensagem enviada com sucesso', id: result.insertId });
  });
});

const isLink = (text: string): boolean => {
  return text.startsWith('https://') || text.startsWith('http://') || text.includes('.com');
};

router.post('/getMessages', (req: Request, res: Response) => {
    const { idUser, idContato } = req.body;
    
    if (!idUser || !idContato) {
        return res.status(400).send({ error: 'Dados incompletos' });
    }
  
    const sql = `
        SELECT * FROM chat
        WHERE (idUser = ? AND idContato = ?)
            OR (idUser = ? AND idContato = ?)
        ORDER BY id ASC
    `;
    
    db.query(sql, [idUser, idContato, idContato, idUser], (err, results) => {
        if (err) {
            console.error('Erro ao buscar mensagens: ', err);
            return res.status(500).send({ error: 'Erro ao buscar mensagens' });
        }
        res.send({ messages: results });
    });
});

router.delete('/excluirMensagem', (req: Request, res: Response) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).send({ error: 'ID da mensagem não fornecido' });
  }
  
  const sql = 'DELETE FROM chat WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Erro ao excluir a mensagem: ', err);
      return res.status(500).send({ error: 'Erro ao excluir a mensagem' });
    }
    
    const io = req.app.get('io');
    io.emit('messageDeleted', { id });
    
    res.send({ message: 'Mensagem excluída com sucesso' });
  });
});

router.put('/editarMensagem', (req: Request, res: Response) => {
  const { id, message } = req.body;

  if (!id || !message) {
    return res.status(400).send({ error: 'Dados incompletos' });
  }

  const sql = 'UPDATE chat SET mensagem = ? WHERE id = ?';
  db.query(sql, [message, id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar a mensagem: ', err);
      return res.status(500).send({ error: 'Erro ao atualizar a mensagem' });
    }
    
    const io = req.app.get('io');
    io.emit('messageUpdated', { id, message });

    res.send({ message: 'Mensagem atualizada com sucesso' });
  });
});

export default router;
