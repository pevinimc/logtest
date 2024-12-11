require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Rota de saúde para verificar a API
app.get('/health', (req, res) => {
    res.status(200).send('API está funcionando corretamente');
});

// Conectar ao MongoDB
const mongoURI = process.env.DATABASE_URL;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB!');
}).catch(err => {
    console.error('Erro ao conectar ao MongoDB', err);
    process.exit(1);
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    profile: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Rota de Registro de Administrador
app.post('/register', async (req, res) => {
    console.log('Body recebido no /register:', req.body);

    const { admin_codigo, admin_senha } = req.body;

    if (!admin_codigo || !admin_senha) {
        return res.status(400).send('Campos obrigatórios faltando.');
    }

    try {
        const hashedPassword = await bcrypt.hash(admin_senha, 10);
        const newAdmin = new User({ username: admin_codigo, password: hashedPassword, profile: 'admin' });

        await newAdmin.save();
        res.status(201).send('Administrador registrado com sucesso!');
    } catch (err) {
        console.error('Erro ao registrar administrador:', err);
        res.status(500).send('Erro ao registrar administrador.');
    }
});

// Rota de Login
app.post('/login', async (req, res) => {
    console.log('Body recebido no /login:', req.body);

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Campos obrigatórios faltando.');
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send('Usuário não encontrado.');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Senha incorreta.');
        }

        res.status(200).send('Login bem-sucedido!');
    } catch (err) {
        console.error('Erro ao processar login:', err);
        res.status(500).send('Erro ao processar login.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
