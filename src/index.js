require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Adicionando o pacote CORS

const app = express(); // Definindo a variável 'app'
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors()); // Usando o middleware CORS

// Conectar ao MongoDB
const mongoURI = process.env.DATABASE_URL;

console.log('DATABASE_URL:', mongoURI); // Log para verificar a variável de ambiente

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

// Modelo de Usuário
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Rota de Registro
app.post('/register', async (req, res) => {
  console.log('Body recebido no /register:', req.body); // Log para verificar o corpo da requisição
  const { username, password } = req.body;

  if (!username || !password) {
    console.error('Campos obrigatórios faltando no /register.');
    return res.status(400).send('Campos obrigatórios faltando.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();
    console.log('Usuário registrado com sucesso:', newUser);
    res.status(201).send('Usuário registrado com sucesso!');
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).send('Erro ao registrar usuário.');
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  console.log('Body recebido no /login:', req.body); // Log para verificar o corpo da requisição
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