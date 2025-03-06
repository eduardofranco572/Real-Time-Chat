import express, { Request, Response } from 'express';
import db from '../server/db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configuração do multer
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

router.get('/getStatus/:idUser', (req: Request, res: Response) => {
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
      
      res.send({ message: 'ok', statuses });
    } else {
      res.send({ message: 'Nenhum status encontrado' });
    }
  });
});

router.get('/getUserStatuses/:idContato', (req: Request, res: Response) => {
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

    res.send({ message: 'ok', statusImage });
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
      return res.send({ message: 'Nenhum status encontrado', statuses: [] });
    }

    const statuses = results.map((status: any) => ({
      id: status.id,
      imgStatus: `../../${status.imgStatus}`,
      legenda: status.legenda,
      imgContato: `../../upload/${status.imgUser}`,
    }));

    res.send({ message: 'ok', statuses });
  });
});

export default router;
