import express, { Request, Response } from 'express';
import db from '../server/db'; 

const router = express.Router();

router.post('/salvarMensagem', (req: Request, res: Response) => {
    const { idUser, idContato, message } = req.body;
    
    if (!idUser || !idContato || !message) {
      return res.status(400).send({ error: 'Dados incompletos' });
    }
  
    const sql = "INSERT INTO chat (idUser, idContato, mensagem) VALUES (?, ?, ?)";
    db.query(sql, [idUser, idContato, message], (err, result) => {
      if (err) {
        console.error('Erro ao salvar a mensagem: ', err);
        return res.status(500).send({ error: 'Erro ao salvar a mensagem' });
      }
      
      const newMessage = {
        id: result.insertId,
        idUser,
        idContato,
        mensagem: message
      };
  
      const io = req.app.get('io');
      io.emit('newMessage', newMessage);
  
      res.send({ message: 'Mensagem enviada com sucesso', id: result.insertId });
    });
});

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

export default router;
