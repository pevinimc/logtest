require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Adicionando o pacote CORS

const app = express(); // Definindo a variável 'app'
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Configuração Específica de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

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
  profile: { type: String, default: 'user' } // Adicionando perfil de usuário
});

const User = mongoose.model('User', userSchema);

// Rota de Registro de Administrador
app.post('/register', async (req, res) => {
  console.log('Body recebido no /register:', req.body); // Log para verificar o corpo da requisição
  const { admin_codigo, admin_senha } = req.body;

  if (!admin_codigo || !admin_senha) {
    console.error('Campos obrigatórios faltando no /register.');
    return res.status(400).send('Campos obrigatórios faltando.');
  }

  const hashedPassword = await bcrypt.hash(admin_senha, 10);

  const newAdmin = new User({ username: admin_codigo, password: hashedPassword, profile: 'admin' });

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
