import express, { Request, Response } from 'express';
import db from './db';

const router = express.Router();

router.post('/cadastrar', (req: Request, res: Response) => {
  const { nome, email, senha } = req.body
  console.log('###################### NOME ######################\n' + JSON.stringify(req.body));

  try {
    const sql: string = "INSERT INTO usuario (nome, email, senha) VALUES ('" + nome + "', '" + email + "', '" + senha + "')";
    db.query(sql, (err) => {
      if (err) {
        console.error('Erro ao cadastrar usuário: ', err);
        res.status(500).send({ error: 'Erro ao cadastrar usuário' });
        return;
      }
    });
    // db.end();
    res.send({ message: 'ok' });
  } catch (error) {
    console.error('Erro durante o cadastro:', error);
    res.status(500).send({ error: 'Erro interno durante o cadastro\n ' });
  }
});

router.post('/login', (req: Request, res: Response) => {
  const { email, senha } = req.body;

  const sql: string = "SELECT id, nome, img FROM usuario WHERE email = '" + email + "' AND senha = '" + senha + "'";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro ao realizar login: ', err);
      return res.status(500).send('Erro ao realizar login');
    }

    if (result.length > 0) {
      const user = result[0];
      console.log('Usuário logado com sucesso:', user);
      res.send({ message: 'ok', user });
    } else {
      res.status(401).send('Credenciais inválidas');
    }
  });
});

router.post('/addcontato', (req: Request, res: Response) => {
  const { email, nome, idUser } = req.body;
  console.log(JSON.stringify(req.body));

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
    const sqlInsertContato = "INSERT INTO contatos (idUser, idUser, nomeContato) VALUES (?, ?, ?)";

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
}

router.post('/PegaContatos', (req: Request, res: Response) => {
  const { idUser } = req.body;

  const sql = "SELECT * FROM contatos WHERE idUser = ?";

  db.query(sql, [idUser], (err, results: Contato[]) => {
    if (err) {
      console.error('Erro ao buscar dados dos usuários: ', err);
      return res.status(500).send({ error: 'Erro ao buscar dados dos usuários' });
    }
    
    if (results.length > 0) {
      res.send({
        message: 'ok',
        contatos: results
      });
    } else {
      res.send({ message: 'Nenhum contato encontrado para o usuário' });
    }
  });

});


export default router;
