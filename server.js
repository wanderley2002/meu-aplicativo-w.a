const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projeto_energetico'
});

db.connect((err) => {
    if (err) return console.error('❌ Erro MySQL: ' + err.stack);
    console.log('✅ MySQL Conectado!');
});

let usuariosOnline = {};

app.get('/consumo/:marca', (req, res) => {
    const marca = req.params.marca;
    db.query('SELECT quantidade FROM consumo WHERE marca = ?', [marca], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ total: results[0] ? results[0].quantidade : 0 });
    });
});

app.post('/adicionar', (req, res) => {
    const { marca } = req.body;
    db.query('UPDATE consumo SET quantidade = quantidade + 1 WHERE marca = ?', [marca], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ mensagem: "Somado!" });
    });
});

app.post('/zerar', (req, res) => {
    const { marca } = req.body;
    db.query('UPDATE consumo SET quantidade = 0 WHERE marca = ?', [marca], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ mensagem: "Zerado!" });
    });
});

io.on('connection', (socket) => {
    socket.on('usuario_entrou', (nome) => {
        socket.username = nome;
        usuariosOnline[socket.id] = { nome: nome, pontos: 0 };
        io.emit('receber_mensagem', { nome: "SISTEMA", msg: `🚀 ${nome} entrou no ranking!` });
        io.emit('atualizar_ranking', Object.values(usuariosOnline));
        io.emit('atualizar_usuarios', Object.values(usuariosOnline));
    });

    socket.on('bebeu_energetico', (marca) => {
        if (usuariosOnline[socket.id]) {
            usuariosOnline[socket.id].pontos += 1;
            io.emit('aviso_bebeu', { nome: usuariosOnline[socket.id].nome, marca: marca });
            io.emit('atualizar_ranking', Object.values(usuariosOnline));
        }
    });

    socket.on('forcar_atualizacao_geral', () => {
        io.emit('atualizar_geral');
    });

    socket.on('enviar_mensagem', (dados) => {
        io.emit('receber_mensagem', dados);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete usuariosOnline[socket.id];
            io.emit('atualizar_ranking', Object.values(usuariosOnline));
            io.emit('atualizar_usuarios', Object.values(usuariosOnline));
            io.emit('receber_mensagem', { nome: "SISTEMA", msg: `👋 ${socket.username} saiu.` });
        }
    });
});

http.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
});