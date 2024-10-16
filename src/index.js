import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

let carros = [];
let id = 1;
let usuarios = [];
let userId = 1; 

app.post('/carros', (req, res) => {
    const { modelo, marca, ano, cor, preco } = req.body;
    const novoCarro = {
        id: id++,
        modelo,
        marca,
        ano,
        cor,
        preco
    };
    carros.push(novoCarro);
    res.status(201).json(novoCarro);
});

app.get('/carros', (req, res) => {
    const listaVeiculos = carros.map(carro =>
        `ID: ${carro.id} | Modelo: ${carro.modelo} | Marca: ${carro.marca} | Ano: ${carro.ano} | Cor: ${carro.cor} | Preço: R$${carro.preco}`
    );
    res.send(listaVeiculos.join('\n'));
});
app.get('/carros/marca/:marca', (req, res) => {
    const { marca } = req.params;
    const carrosFiltrados = carros.filter(carro => carro.marca.toLowerCase() === marca.toLowerCase());

    if (carrosFiltrados.length === 0) {
        return res.status(404).send('Nenhum veículo encontrado para essa marca.');
    }

    const listaFiltrada = carrosFiltrados.map(carro =>
        `ID: ${carro.id} | Modelo: ${carro.modelo} | Cor: ${carro.cor} | Preço: R$${carro.preco}`
    );
    res.send(listaFiltrada.join('\n'));
});

app.put('/carros/:id', (req, res) => {
    const { id } = req.params;
    const { cor, preco } = req.body;

    const carro = carros.find(carro => carro.id == id);
    if (!carro) {
        return res.status(404).send('Veículo não encontrado. Volte ao menu inicial.');
    }

    carro.cor = cor || carro.cor;
    carro.preco = preco || carro.preco;

    res.json({ mensagem: 'Veículo atualizado com sucesso', carro });
});

app.delete('/carros/:id', (req, res) => {
    const { id } = req.params;

    const indice = carros.findIndex(carro => carro.id == id);
    if (indice === -1) {
        return res.status(404).send('Veículo não encontrado. Volte ao menu inicial.');
    }

    carros.splice(indice, 1);
    res.json({ mensagem: 'Veículo removido com sucesso' });
});

app.post('/usuarios', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).send('Todos os campos (nome, email, senha) são obrigatórios.');
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10); 

    const novoUsuario = {
        id: userId++,
        nome,
        email,
        senha: senhaCriptografada
    };

    usuarios.push(novoUsuario);
    res.status(201).json({ mensagem: 'Usuário criado com sucesso' });
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).send('Email e senha são obrigatórios.');
    }

    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
        return res.status(404).send('Usuário não encontrado.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
        return res.status(400).send('Senha incorreta.');
    }

    res.json({ mensagem: 'Login realizado com sucesso' });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
