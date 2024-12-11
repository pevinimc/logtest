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
  profile: { type: String, default: 'user' } // Adicionando perfil de usuário
});

const User = mongoose.model('User', userSchema);

// Rota de Registro de Administrador
app.post('/register-admin', async (req, res) => {
  console.log('Body recebido no /register-admin:', req.body); // Log para verificar o corpo da requisição
  const { admin_codigo, admin_senha } = req.body;

  if (!admin_codigo || !admin_senha) {
    console.error('Campos obrigatórios faltando no /register-admin.');
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

// Rotas existentes (login e registro de usuário)...

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
