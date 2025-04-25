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
  const { idUser } = req.body
  if (!idUser) {
    return res.status(400).json({ error: 'idUser é obrigatório' })
  }

  const sql = `
    (
      -- contatos individuais
      SELECT
        C.idContato AS id,
        C.nomeContato AS nome,
        U.img AS img,
        LM.mensagem,
        LM.mediaUrl,
        LM.lastMessageAt,
        U2.nome AS lastSenderName,
        (
          SELECT cp1.idChat
          FROM chat_participants cp1
          JOIN chat_participants cp2
            ON cp1.idChat = cp2.idChat
          WHERE cp1.idUser = ?        
            AND cp2.idUser = C.idContato
          LIMIT 1
        ) AS chatId,
        FALSE  AS isGroup
      FROM contatos C
      INNER JOIN usuario U
        ON U.ID = C.idContato
      LEFT JOIN (
        -- última mensagem de cada chat
        SELECT
          cm.idChat,
          cm.mensagem,
          cm.mediaUrl,
          cm.createdAt AS lastMessageAt,
          cm.idUser AS senderId
        FROM chat_messages cm
        INNER JOIN (
          SELECT idChat, MAX(createdAt) AS createdAt
          FROM chat_messages
          GROUP BY idChat
        ) t
          ON cm.idChat = t.idChat
         AND cm.createdAt = t.createdAt
      ) AS LM
        ON LM.idChat = (
          SELECT cp1.idChat
          FROM chat_participants cp1
          JOIN chat_participants cp2
            ON cp1.idChat = cp2.idChat
          WHERE cp1.idUser = ?      
            AND cp2.idUser = C.idContato
          LIMIT 1
        )
      LEFT JOIN usuario U2
        ON U2.ID = LM.senderId

      WHERE C.idUser = ? 
    )

    UNION ALL

    (
      -- grupos
      SELECT
        G.id AS id,
        G.nomeGrupo AS nome,
        G.imgGrupo AS img,
        LM2.mensagem,
        LM2.mediaUrl,
        LM2.lastMessageAt,
        U3.nome AS lastSenderName,
        G.idChat AS chatId,
        TRUE AS isGroup
      FROM grupos G
      INNER JOIN chat_participants cp
        ON cp.idChat = G.idChat
       AND cp.idUser = ?           
      LEFT JOIN (
        -- última mensagem de cada grupo
        SELECT
          cm.idChat,
          cm.mensagem,
          cm.mediaUrl,
          cm.createdAt AS lastMessageAt,
          cm.idUser AS senderId
        FROM chat_messages cm
        INNER JOIN (
          SELECT idChat, MAX(createdAt) AS createdAt
          FROM chat_messages
          GROUP BY idChat
        ) t
          ON cm.idChat = t.idChat
         AND cm.createdAt = t.createdAt
      ) AS LM2
        ON LM2.idChat = G.idChat
      LEFT JOIN usuario U3
        ON U3.ID = LM2.senderId
    )

    ORDER BY lastMessageAt DESC;
  `

  db.query(
    sql,
    [
      idUser,
      idUser,
      idUser,
      idUser
    ],
    (err, results: any[]) => {
      if (err) {
        console.error('Erro ao buscar contatos e grupos:', err)
        return res.status(500).json({ error: 'Erro no servidor' })
      }

      const lista = results.map(item => ({
        id: item.id,
        nome: item.nome,
        imageUrl: item.img
                  ? `../../upload/${item.isGroup ? 'grupo' : 'imagensUser'}/${item.img}`
                  : '',
        mensagem: item.mensagem,
        mediaUrl: item.mediaUrl,
        lastMessageAt: item.lastMessageAt,
        chatId: item.chatId,
        isGroup: !!item.isGroup,
        lastSenderName: item.lastSenderName || '',
      }))

      res.json({ message: 'ok', lista })
    }
  )
})

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
