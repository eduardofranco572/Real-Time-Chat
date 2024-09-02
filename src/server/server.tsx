import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes';

const app: Application = express();
const port: number = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  credentials: true
}));

app.use('/', router);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Página inicial');
});

