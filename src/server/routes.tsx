import express, { Request, Response, NextFunction }  from 'express';
import db from './db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const router = express.Router();
const SECRET_KEY = '2323e12a';

router.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = 'upload/';
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const storageStatus = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = 'upload/status/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); 
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadStatus = multer({ storage: storageStatus });

router.post('/cadastrar', upload.single('img'), (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  const imgPath = req.file ? req.file.filename : null;

  try {
    const checkEmailSql: string = "SELECT COUNT(*) AS count FROM usuario WHERE email = ?";
    db.query(checkEmailSql, [email], (err, results) => {
      if (err) {
        console.error('Erro ao verificar email:', err);
        res.status(500).send({ error: 'Erro ao verificar email' });
        return;
      }

      if (results[0].count > 0) {
        res.status(400).send({ message: 'email' });
        return;
      }

      const insertSql: string = "INSERT INTO usuario (nome, email, senha, img) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [nome, email, senha, imgPath], (err) => {
        if (err) {
          console.error('Erro ao cadastrar usuário:', err);
          res.status(500).send({ error: 'Erro ao cadastrar usuário' });
          return;
        }

        res.send({ message: 'ok' });
      });
    });
  } catch (error) {
    console.error('Erro durante o cadastro:', error);
    res.status(500).send({ error: 'Erro interno durante o cadastro' });
  }
});

router.post('/login', (req: Request, res: Response) => {
  const { email, senha } = req.body;

  const sql: string = "SELECT id, nome, img FROM usuario WHERE email = ? AND senha = ?";
  db.query(sql, [email, senha], (err, result) => {
    if (err) {
      console.error('Erro ao realizar login: ', err);
      return res.status(500).send('Erro ao realizar login');
    }

    if (result.length > 0) {
      const user = result[0];
      const id = user.id
      const token = jwt.sign({ id: user.id }, SECRET_KEY);

      res.cookie('authToken', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      console.log('Usuário logado com sucesso:', user);
      res.send({ message: 'ok', id });
    } else {
      res.status(401).send('Credenciais inválidas');
    }
  });
});

//autenticação de usuário
interface MyJwtPayload extends JwtPayload {
  id: number;
}

interface CustomRequest extends Request {
  user?: MyJwtPayload | string;
}

const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.authToken;
  try {
      const decoded = jwt.verify(token, SECRET_KEY) as MyJwtPayload; 
      req.user = decoded;
      next();
  } catch (err) {
      return res.status(403).json({ message: 'Invalid token' });
  }
};

router.get('/protected', authenticateJWT, (req: CustomRequest, res: Response) => {
  if (typeof req.user === 'object' && req.user !== null && 'id' in req.user) {
    const userId = (req.user as MyJwtPayload).id;
    res.status(201).json({ 
      message: 'Rota para autenticação de usuário!', 
      user: userId 
    });
  } else {
    res.status(401).json({ message: 'Usuário não autenticado' });
  }
});

router.post('/addcontato', (req: Request, res: Response) => {
  const { email, nome, idUser } = req.body;

  const sqlCheckEmail = "SELECT id FROM usuario WHERE email = ?";

  db.query(sqlCheckEmail, [email], (err, result) => {
    if (err) {
      console.error('Erro ao verificar o email: ', err);
      return res.status(500).send({ error: 'Erro ao verificar o email' });
    }

    if (result.length === 0) {
      return res.status(401).send('Usuario não encontrado');
    }

    const idContato = result[0].id;
    const sqlInsertContato = "INSERT INTO contatos (idUser, idContato, nomeContato) VALUES (?, ?, ?)";

    db.query(sqlInsertContato, [idUser, idContato, nome], (err) => {
      if (err) {
        console.error('Erro ao Adicionar usuario: ', err);
        return res.status(500).send({ error: 'Erro ao cadastrar usuário' });
      }
      res.send({ message: 'ok' });
    });
  });
});

interface Contato {
  nomeContato: string;
  idContato: number;
  img?: string;
}

router.post('/PegaContatos', (req: Request, res: Response) => {
  const { idUser } = req.body;

  const sql = `
    SELECT C.nomeContato, C.idContato, U.img 
    FROM contatos C
    INNER JOIN usuario U ON U.ID = C.idContato
    WHERE C.idUser = ?;
  `;

  db.query(sql, [idUser], (err, results: Contato[]) => {
    if (err) {
      console.error('Erro ao buscar dados dos contatos: ', err);
      return res.status(500).send({ error: 'Erro ao buscar dados dos contatos' });
    }
    
    if (results.length > 0) {
      const contatos = results.map((contato) => ({
        id: contato.idContato,
        nomeContato: contato.nomeContato,
        imageUrl: contato.img ? `../../upload/${contato.img}` : ''
      }));
      
      res.send({
        message: 'ok',
        contatos
      });
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
      const imageUrl = img ? `../../upload/${img}` : '';
      res.send({
        message: 'ok',
        nome,
        descricao,
        imageUrl,
        email
      });
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
      const imageUrl = contatoData.img ? `../../upload/${contatoData.img}` : '';

      res.send({
        message: 'ok',
        ...contatoData,
        imageUrl
      });
    } else {
      res.send({ message: 'Contato não encontrado' });
    }
  });
});

router.get('/getStatus/:idUser', (req, res) => {
  const { idUser } = req.params;

  if (!idUser) {
    return res.status(400).send({ error: 'ID do usuário não fornecido.' });
  }

  const sql = `
    SELECT 
      status.id,
      status.idAutor AS idUser,
      contatos.idContato AS idContato,
      contatos.nomeContato AS nomeContato,
      status.imgStatus,
      status.legenda
    FROM 
      contatos
    INNER JOIN 
      status 
    ON 
      contatos.idContato = status.idAutor
    WHERE 
      contatos.idUser = ?
    GROUP BY 
      status.idAutor;
  `;

  db.query(sql, [idUser], (err, results) => {
    if (err) {
      console.error('Erro ao buscar status:', err);
      return res.status(500).send({ error: 'Erro ao buscar status' });
    }

    if (results.length > 0) {
      const statuses = results.map((status: any) => ({
        id: status.id,
        idAutor: status.idUser,
        idContato: status.idContato,
        nomeContato: status.nomeContato,
        imgStatus: `../../${status.imgStatus}`,
        legenda: status.legenda,
      }));
      
      res.send({
        message: 'ok',
        statuses,
      });
    } else {
      console.log('Nenhum status encontrado.');
      res.send({ message: 'Nenhum status encontrado' });
    }
  });
});

router.get('/getUserStatuses/:idContato', (req, res) => {
  const { idContato } = req.params;

  if (!idContato) {
    return res.status(400).send({ error: 'ID do contato não fornecido.' });
  }

  const sql = `
    SELECT 
      status.id,
      status.imgStatus,
      status.legenda,
      usuario.img AS imgContato
    FROM 
      status
    INNER JOIN 
      contatos
    ON 
      contatos.idContato = status.idAutor
    LEFT JOIN 
      usuario
    ON 
      usuario.id = contatos.idContato
    WHERE 
      status.idAutor = ?;
  `;

  db.query(sql, [idContato], (err, results) => {
    if (err) {
      console.error('Erro ao buscar status do contato:', err);
      return res.status(500).send({ error: 'Erro ao buscar status do contato' });
    }

    res.send({
      message: 'ok',
      statuses: results.map((status: any) => ({
        id: status.id,
        imgStatus: `../../${status.imgStatus}`,
        legenda: status.legenda,
        imgContato: `../../upload/${status.imgContato}`,
      })),
    });
  });
});

router.post('/salvarStatus', uploadStatus.single('imgStatus'), (req: Request, res: Response) => {
  const { idAutor, legenda } = req.body;
  const imgStatus = req.file ? `upload/status/${req.file.filename}` : null;

  if (!idAutor) {
    return res.status(400).send({ error: 'ID do autor não fornecido' });
  }

  if (!imgStatus) {
    return res.status(400).send({ error: 'Imagem não fornecida' });
  }

  const sqlGetNomeAutor = `SELECT nome FROM usuario WHERE id = ?`;
  db.query(sqlGetNomeAutor, [idAutor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar nome do autor:', err);
      return res.status(500).send({ error: 'Erro ao buscar nome do autor' });
    }

    if (results.length === 0) {
      return res.status(404).send({ error: 'Autor não encontrado' });
    }

    const nomeAutor = results[0].nome;

    const sqlInsertStatus = `
      INSERT INTO status (idAutor, nomeAutor, imgStatus, legenda)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sqlInsertStatus, [idAutor, nomeAutor, imgStatus, legenda || null], (err) => {
      if (err) {
        console.error('Erro ao salvar status:', err);
        return res.status(500).send({ error: 'Erro ao salvar status' });
      }

      res.send({ message: 'Status salvo com sucesso!' });
    });
  });
});

router.post('/statusUsuarioCapa', (req: Request, res: Response) => {
  const { idUser } = req.body;

  const sql = `
    SELECT S.ImgStatus 
    FROM status S
    WHERE S.idAutor = ?
    LIMIT 1;
  `;

  db.query(sql, [idUser], (err, results) => {
    if (err) {
      console.error('Erro ao buscar status do usuário: ', err);
      return res.status(500).send({ error: 'Erro ao buscar status do usuário' });
    }

    const statusImage = results.length > 0 
      ? `../../${results[0].ImgStatus}` 
      : '../assets/img/iconePadrao.svg';

    res.send({
      message: 'ok',
      statusImage,
    });
  });
});

router.post('/statusUsuario', (req: Request, res: Response) => {
  const { idUser } = req.body; 

  const sql = `
    SELECT 
      S.id,
      S.imgStatus,
      S.legenda,
      U.img AS imgUser
    FROM 
      status S
    INNER JOIN 
      usuario U
    ON 
      U.id = S.idAutor
    WHERE 
      S.idAutor = ?;
  `;

  db.query(sql, [idUser], (err, results) => {
    if (err) {
      console.error('Erro ao buscar status do usuário: ', err);
      return res.status(500).send({ error: 'Erro ao buscar status do usuário' });
    }

    if (results.length === 0) {
      return res.send({
        message: 'Nenhum status encontrado',
        statuses: [],
      });
    }

    const statuses = results.map((status: any) => ({
      id: status.id,
      imgStatus: `../../${status.imgStatus}`,
      legenda: status.legenda,
      imgContato: `../../upload/${status.imgUser}`,
    }));

    res.send({
      message: 'ok',
      statuses,
    });
  });
});

export default router;
