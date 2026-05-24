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

// --- BANCO DE DADOS ---
const db = mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    user: '3DmiyYl9FhBC24p.root',
    password: 'Rc55SyqMk1UwM9o4',
    database: 'test',
    port: 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar no TiDB: ' + err.stack);
        return;
    }
    console.log('✅ Conectado ao TiDB com sucesso!');
});

let usuariosOnline = {};

// ==========================================
// GET /consumo/:marca (CORRIGIDO)
// ==========================================
app.get('/consumo/:marca', (req, res) => {

    const marca = req.params.marca;

    db.query(
        'SELECT quantidade FROM consumo WHERE marca = ?',
        [marca],
        (err, results) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    erro: "Erro no banco",
                    detalhe: err.message
                });
            }

            // evita crash
            if (!results || results.length === 0) {
                return res.json({ total: 0 });
            }

            return res.json({
                total: results[0].quantidade || 0
            });
        }
    );
});

// ==========================================
// POST /adicionar (CORRIGIDO)
// ==========================================
app.post('/adicionar', (req, res) => {

    const { marca } = req.body;

    db.query(
        'UPDATE consumo SET quantidade = quantidade + 1 WHERE marca = ?',
        [marca],
        (err, results) => {

            if (err) {
                console.log(err);
                return res.status(500).json({ erro: err.message });
            }

            // se não existir, cria
            if (results.affectedRows === 0) {
                db.query(
                    'INSERT INTO consumo (marca, quantidade) VALUES (?, 1)',
                    [marca]
                );
            }

            res.json({ mensagem: "Somado!" });
        }
    );
});

// ==========================================
// POST /zerar (CORRIGIDO)
// ==========================================
app.post('/zerar', (req, res) => {

    const { marca } = req.body;

    db.query(
        'UPDATE consumo SET quantidade = 0 WHERE marca = ?',
        [marca],
        (err, results) => {

            if (err) {
                console.log(err);
                return res.status(500).json({ erro: err.message });
            }

            // se não existir, cria zerado
            if (results.affectedRows === 0) {
                db.query(
                    'INSERT INTO consumo (marca, quantidade) VALUES (?, 0)',
                    [marca]
                );
            }

            res.json({ mensagem: "Zerado!" });
        }
    );
});

// ==========================================
// SOCKET.IO (SEM MUDANÇA)
// ==========================================
io.on('connection', (socket) => {

    socket.on('usuario_entrou', (nome) => {
        socket.username = nome;

        usuariosOnline[socket.id] = {
            nome: nome,
            pontos: 0
        };

        io.emit('receber_mensagem', {
            nome: "SISTEMA",
            msg: `🚀 ${nome} entrou no ranking!`
        });

        io.emit('atualizar_ranking', Object.values(usuariosOnline));
        io.emit('atualizar_usuarios', Object.values(usuariosOnline));
    });

    socket.on('bebeu_energetico', (marca) => {

        if (usuariosOnline[socket.id]) {

            usuariosOnline[socket.id].pontos += 1;

            io.emit('aviso_bebeu', {
                nome: usuariosOnline[socket.id].nome,
                marca: marca
            });

            io.emit('atualizar_ranking', Object.values(usuariosOnline));
        }
    });

    socket.on('enviar_mensagem', (dados) => {
        io.emit('receber_mensagem', dados);
    });

    socket.on('disconnect', () => {

        if (socket.username) {

            delete usuariosOnline[socket.id];

            io.emit('atualizar_ranking', Object.values(usuariosOnline));
            io.emit('atualizar_usuarios', Object.values(usuariosOnline));

            io.emit('receber_mensagem', {
                nome: "SISTEMA",
                msg: `👋 ${socket.username} saiu.`
            });
        }
    });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
