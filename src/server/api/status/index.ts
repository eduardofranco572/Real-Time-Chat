import express, { Request, Response } from 'express';
import db from '../../db';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configuração do multer para aceitar imagens e vídeos
const storageStatus = multer.diskStorage({
  destination: function (req, _file, cb) {
    const idAutor = req.body.idAutor;
    if (!idAutor) {
      return cb(new Error("idAutor é obrigatório para upload de status."), "");
    }
    const userFolder = path.join('upload/status', idAutor.toString());
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadStatus = multer({ 
  storage: storageStatus,
  fileFilter: function (_req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens e vídeos são permitidos!'));
    }
  }
});

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
      S.id,
      S.imgStatus,
      S.legenda,
      U.img AS imgContato
    FROM 
      status S
    LEFT JOIN 
      usuario U
    ON 
      U.id = S.idAutor
    WHERE 
      S.idAutor = ?
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
        imgContato: `../../upload/imagensUser/${status.imgContato}`,
      })),
    });
  });
});

router.post('/salvarStatus', uploadStatus.single('mediaStatus'), (req: Request, res: Response) => {
  const { idAutor, legenda } = req.body;
  const mediaStatus = req.file ? req.file.path : null;

  if (!idAutor) {
    return res.status(400).send({ error: 'ID do autor não fornecido' });
  }
  if (!mediaStatus) {
    return res.status(400).send({ error: 'Arquivo não fornecido' });
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
    db.query(sqlInsertStatus, [idAutor, nomeAutor, mediaStatus, legenda || null], (err) => {
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
      imgContato: `../../upload/imagensUser/${status.imgUser}`,
    }));

    res.send({ message: 'ok', statuses });
  });
});

router.delete('/excluirStatus/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ error: 'ID do status não fornecido.' });
  }

  const sqlGetStatus = 'SELECT imgStatus FROM status WHERE id = ?';
  db.query(sqlGetStatus, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar status:', err);
      return res.status(500).send({ error: 'Erro ao buscar status' });
    }
    if (results.length === 0) {
      return res.status(404).send({ error: 'Status não encontrado.' });
    }

    const imgStatusPath = results[0].imgStatus;
    const sqlDeleteStatus = 'DELETE FROM status WHERE id = ?';
    db.query(sqlDeleteStatus, [id], (err) => {
      if (err) {
        console.error('Erro ao excluir status:', err);
        return res.status(500).send({ error: 'Erro ao excluir status' });
      }

      const fullPath = path.join(__dirname, '../../', imgStatusPath);
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error('Erro ao excluir arquivo:', err);
            return res.status(500).send({ error: 'Erro ao excluir arquivo' });
          }
          res.send({ message: 'Status excluído com sucesso!' });
        });
      } else {
        res.send({ message: 'Status excluído, mas o arquivo não foi encontrado para exclusão.' });
      }
      
    });
  });
});


export default router;
