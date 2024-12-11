require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configuração do CORS
const corsOptions = {
  origin: '*', // Permite todas as origens (para desenvolvimento)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Middleware para lidar com requisições de pré-voo
app.options('*', cors(corsOptions));

// Rota de saúde para verificar a API
app.get('/health', (req, res) => {
  res.status(200).send('API está funcionando corretamente');
});

// Conectar ao MongoDB
const mongoURI = process.env.DATABASE_URL;

if (!mongoURI) {
  console.error('A variável DATABASE_URL não está definida no arquivo .env.');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado ao MongoDB!');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB', err);
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  profile: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Rota de Registro de Administrador
app.post('/register', cors(corsOptions), async (req, res) => {
  console.log('Body recebido no /register:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    console.error('Campos obrigatórios faltando no /register.');
    return res.status(400).send('Campos obrigatórios faltando.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = new User({ username, password: hashedPassword, profile: 'admin' });

  try {
    await newAdmin.save();
    console.log('Administrador registrado com sucesso:', newAdmin);
    res.status(201).send('Administrador registrado com sucesso!');
  } catch (err) {
    console.error('Erro ao registrar administrador:', err);
    res.status(500).send('Erro ao registrar administrador.');
  }
});

// Rota de Login
app.post('/login', cors(corsOptions), async (req, res) => {
  console.log('Body recebido no /login:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    console.error('Campos obrigatórios faltando no /login.');
    return res.status(400).send('Campos obrigatórios faltando.');
  }

  try {
    const user = await User.findOne({ username });
    console.log('Usuário encontrado:', user);

    if (!user) {
      console.error('Usuário não encontrado.');
      return res.status(400).send('Usuário não encontrado.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Resultado da comparação de senha:', isMatch);

    if (!isMatch) {
      console.error('Senha incorreta.');
      return res.status(400).send('Senha incorreta.');
    }

    console.log('Login bem-sucedido.');
    res.status(200).send('Login bem-sucedido!');
  } catch (err) {
    console.error('Erro ao processar login:', err);
    res.status(500).send('Erro ao processar login.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
