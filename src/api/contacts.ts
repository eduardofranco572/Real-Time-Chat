import express, { Request, Response } from 'express';
import db from '../server/db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = 'upload/imagensUser';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/addcontato', (req: Request, res: Response) => {
  const { email, nome, idUser } = req.body;
  const sqlCheckEmail = "SELECT id FROM usuario WHERE email = ?";

  db.query(sqlCheckEmail, [email], (err, result) => {
    if (err) {
      console.error('Erro ao verificar o email:', err);
      return res.status(500).send({ error: 'Erro ao verificar o email' });
    }
    if (result.length === 0) {
      return res.status(401).send({ error: 'Usuário não encontrado' });
    }

    const idContato = result[0].id;

    const sqlInsertContato = "INSERT INTO contatos (idUser, idContato, nomeContato) VALUES (?, ?, ?)";
    db.query(sqlInsertContato, [idUser, idContato, nome], (err2) => {
      if (err2) {
        console.error('Erro ao adicionar contato:', err2);
        return res.status(500).send({ error: 'Erro ao cadastrar contato' });
      }

      const nomeChat = null;
      const sqlCreateChat = "INSERT INTO chats (nomeChat) VALUES (?)";
      db.query(sqlCreateChat, [nomeChat], (err3, chatResult) => {
        if (err3) {
          console.error('Erro ao criar chat:', err3);
          return res.status(500).send({ error: 'Erro ao criar chat' });
        }
        const idChat = chatResult.insertId;

        const sqlInsertParticipants = "INSERT INTO chat_participants (idChat, idUser) VALUES (?, ?), (?, ?)";
        db.query(sqlInsertParticipants, [idChat, idUser, idChat, idContato], (err4) => {
          if (err4) {
            console.error('Erro ao inserir participantes do chat:', err4);
            return res.status(500).send({ error: 'Erro ao criar participantes do chat' });
          }

          res.send({ message: 'Contato e chat criados com sucesso', idChat });
        });
      });
    });
  });
});

router.post('/getChatForContact', (req: Request, res: Response) => {
  const { idUser, idContato } = req.body;

  if (!idUser || !idContato) {
    return res.status(400).send({ error: 'idUser e idContato são obrigatórios' });
  }

  const sql = `
    SELECT cp1.idChat
    FROM chat_participants cp1
    JOIN chat_participants cp2 ON cp1.idChat = cp2.idChat
    WHERE cp1.idUser = ? AND cp2.idUser = ?
    LIMIT 1
  `;

  db.query(sql, [idUser, idContato], (err, results) => {
    if (err) {
      console.error('Erro ao buscar o chat:', err);
      return res.status(500).send({ error: 'Erro ao buscar o chat' });
    }
    if (results.length > 0) {
      return res.send({ idChat: results[0].idChat });
    } else {
      return res.status(404).send({ error: 'Chat não encontrado' });
    }
  });
});

router.post('/PegaContatos', (req: Request, res: Response) => {
  const { idUser } = req.body;
  const sql = `
    SELECT C.nomeContato, C.idContato, U.img 
    FROM contatos C
    INNER JOIN usuario U ON U.ID = C.idContato
    WHERE C.idUser = ?;
  `;

  db.query(sql, [idUser], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados dos contatos: ', err);
      return res.status(500).send({ error: 'Erro ao buscar dados dos contatos' });
    }
    
    if (results.length > 0) {
      const contatos = results.map((contato: any) => ({
        id: contato.idContato,
        nomeContato: contato.nomeContato,
        imageUrl: contato.img ? `../../upload/imagensUser/${contato.img}` : ''
      }));
      
      res.send({ message: 'ok', contatos });
    } else {
      res.send({ message: 'Nenhum contato encontrado para o usuário' });
    }
  });
});

router.post('/InfoUser', (req: Request, res: Response) => {
  const { idUser } = req.body;
  const sql = "SELECT * FROM usuario WHERE ID = ?";

  db.query(sql, [idUser], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados dos usuários: ', err);
      return res.status(500).send({ error: 'Erro ao buscar dados dos usuários' });
    }

    if (results.length > 0) {
      const { nome, descricao, img, email } = results[0];
      const imageUrl = img ? `../../upload/imagensUser/${img}` : '';
      res.send({ message: 'ok', nome, descricao, imageUrl, email });
    } else {
      res.send({ message: 'Nenhum contato encontrado para o usuário' });
    }
  });
});

router.post('/InfoContato', (req: Request, res: Response) => {
  const { idUser, idContato } = req.body;
  const sql = `
    SELECT U.*, C.nomeContato
    FROM contatos C
    INNER JOIN usuario U ON U.ID = C.idContato
    WHERE C.idUser = ? AND C.idContato = ?;
  `;

  db.query(sql, [idUser, idContato], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados do contato: ', err);
      return res.status(500).send({ error: 'Erro ao buscar dados do contato' });
    }

    if (results.length > 0) {
      const contatoData = results[0];
      const imageUrl = contatoData.img ? `../../upload/imagensUser/${contatoData.img}` : '';
      res.send({ message: 'ok', ...contatoData, imageUrl });
    } else {
      res.send({ message: 'Contato não encontrado' });
    }
  });
});

router.post('/UpdateUser', upload.single('img'), (req: Request, res: Response) => {
  const { idUser, nome, descricao } = req.body;
  let sql: string;
  let params: any[];

  if (req.file) {
    sql = "UPDATE usuario SET nome = ?, descricao = ?, img = ? WHERE ID = ?";
    params = [nome, descricao, req.file.filename, idUser];
  } else {
    sql = "UPDATE usuario SET nome = ?, descricao = ? WHERE ID = ?";
    params = [nome, descricao, idUser];
  }

  db.query(sql, params, (err) => {
    if (err) {
      console.error('Erro ao atualizar dados do usuário: ', err);
      return res.status(500).send({ error: 'Erro ao atualizar dados do usuário' });
    }
    res.send({ message: 'Dados atualizados com sucesso' });
  });
});

export default router;
