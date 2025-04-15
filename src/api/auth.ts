import express, { Request, Response, NextFunction } from 'express';
import db from '../server/db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const router = express.Router();
const SECRET_KEY = '2323e12a';

router.use(cookieParser());

const storageUserImages = multer.diskStorage({
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

const upload = multer({ storage: storageUserImages });

router.post('/cadastrar', upload.single('img'), (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  const imgPath = req.file ? req.file.filename : null;

  const checkEmailSql: string = "SELECT COUNT(*) AS count FROM usuario WHERE email = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar email:', err);
      return res.status(500).send({ error: 'Erro ao verificar email' });
    }

    if (results[0].count > 0) {
      return res.status(400).send({ message: 'email' });
    }

    const insertSql: string = "INSERT INTO usuario (nome, email, senha, img) VALUES (?, ?, ?, ?)";
    db.query(insertSql, [nome, email, senha, imgPath], (err) => {
      if (err) {
        console.error('Erro ao cadastrar usuário:', err);
        return res.status(500).send({ error: 'Erro ao cadastrar usuário' });
      }
      res.send({ message: 'ok' });
    });
  });
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
      const token = jwt.sign({ id: user.id }, SECRET_KEY);
      res.cookie('authToken', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      console.log('Usuário logado com sucesso:', user);
      res.send({ message: 'ok', id: user.id });
    } else {
      res.status(401).send('Credenciais inválidas');
    }
  });
});

// Middleware para autenticação
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

export default router;
