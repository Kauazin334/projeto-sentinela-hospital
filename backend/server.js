const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

// =========================
// CONFIGURAÇÕES
// =========================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// =========================
// FRONTEND
// =========================

const FRONTEND_DIR = path.join(__dirname, "../frontend");

app.use(express.static(FRONTEND_DIR));

// =========================
// DATABASE
// =========================

const DB_FILE = path.join(__dirname, "db.json");

function defaultDB() {

    return {

        usuarios: [],

        pacientes: [],

        triagens: [],

        consultas: [],

        altas: []

    };

}

// =========================
// LER DATABASE
// =========================

function readDB() {

    // Se não existir, cria
    if (!fs.existsSync(DB_FILE)) {

        const database = defaultDB();

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(database, null, 2),
            "utf-8"
        );

        return database;
    }

    const content = fs.readFileSync(
        DB_FILE,
        "utf-8"
    );

    // Se estiver vazio
    if (!content.trim()) {

        const database = defaultDB();

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(database, null, 2),
            "utf-8"
        );

        return database;
    }

    try {

        const data = JSON.parse(content);

        // Garante que todos os arrays existam

        data.usuarios = Array.isArray(data.usuarios)
            ? data.usuarios
            : [];

        data.pacientes = Array.isArray(data.pacientes)
            ? data.pacientes
            : [];

        data.triagens = Array.isArray(data.triagens)
            ? data.triagens
            : [];

        data.consultas = Array.isArray(data.consultas)
            ? data.consultas
            : [];

        data.altas = Array.isArray(data.altas)
            ? data.altas
            : [];

        return data;

    }

    catch (err) {

        console.error("Erro ao ler db.json:", err);

        const database = defaultDB();

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(database, null, 2),
            "utf-8"
        );

        return database;
    }
}

// =========================
// ESCREVER DATABASE
// =========================

function writeDB(data) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2),
        "utf-8"
    );

}

// =========================
// LOGIN
// =========================

app.post("/login", (req, res) => {

    try {

        const { usuario, senha } = req.body;

        if (!usuario || !senha) {

            return res.status(400).json({

                erro: "Usuário e senha são obrigatórios."

            });

        }

        const db = readDB();

        const user = db.usuarios.find(user => {

            return (
                user.usuario === usuario &&
                user.senha === senha
            );

        });

        if (!user) {

            return res.status(401).json({

                erro: "Usuário ou senha inválidos."

            });

        }

        return res.json({

            id: user.id || null,

            usuario: user.usuario,

            tipo: user.tipo

        });

    }

    catch (err) {

        console.error("Erro no login:", err);

        return res.status(500).json({

            erro: "Erro interno no login."

        });

    }

});

// =========================
// ATENDIMENTO
// =========================

app.post("/atendimento", (req, res) => {

    try {

        const db = readDB();

        const paciente = {

            id: Date.now(),

            ...req.body,

            status: "triagem",

            createdAt: new Date().toISOString()

        };

        db.pacientes.push(paciente);

        writeDB(db);

        return res.json(paciente);

    }

    catch (err) {

        console.error("Erro no atendimento:", err);

        return res.status(500).json({

            erro: "Erro no atendimento."

        });

    }

});

// =========================
// LISTAR PACIENTES
// =========================

app.get("/pacientes", (req, res) => {

    try {

        const db = readDB();

        return res.json(db.pacientes);

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            erro: "Erro ao buscar pacientes."

        });

    }

});

// =========================
// TRIAGEM
// =========================

app.post("/triagem", (req, res) => {

    try {

        const db = readDB();

        let risco = req.body.risco || "verde";

        const temperatura = Number(
            req.body.temperatura
        );

        // =========================
        // CLASSIFICAÇÃO DE RISCO
        // =========================

        if (temperatura > 39) {

            risco = "vermelho";

        }

        else if (temperatura >= 38) {

            risco = "amarelo";

        }

        const triagem = {

            id: Date.now(),

            nome: req.body.nome || "",

            idade: req.body.idade || "",

            temperatura: req.body.temperatura || "",

            sintomas: req.body.sintomas || "",

            alergia: req.body.alergia || "",

            risco: risco,

            status: "aguardando_medico",

            criadoEm: new Date().toISOString()

        };

        db.triagens.push(triagem);

        writeDB(db);

        return res.json(triagem);

    }

    catch (err) {

        console.error("Erro na triagem:", err);

        return res.status(500).json({

            erro: "Erro ao salvar triagem."

        });

    }

});

// =========================
// LISTAR TRIAGENS
// =========================

app.get("/triagens", (req, res) => {

    try {

        const db = readDB();

        return res.json(db.triagens);

    }

    catch (err) {

        console.error("Erro ao buscar triagens:", err);

        return res.status(500).json({

            erro: "Erro ao buscar triagens."

        });

    }

});

// =========================
// CONSULTA
// =========================

app.post("/consulta", (req, res) => {

    try {

        const db = readDB();

        const consulta = {

            id: Date.now(),

            ...req.body,

            createdAt: new Date().toISOString()

        };

        db.consultas.push(consulta);

        writeDB(db);

        return res.json(consulta);

    }

    catch (err) {

        console.error("Erro na consulta:", err);

        return res.status(500).json({

            erro: "Erro ao salvar consulta."

        });

    }

});

// =========================
// LISTAR CONSULTAS
// =========================

app.get("/consultas", (req, res) => {

    try {

        const db = readDB();

        return res.json(db.consultas);

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            erro: "Erro ao buscar consultas."

        });

    }

});

// =========================
// MEDICAÇÕES
// =========================

app.get("/medicacoes", (req, res) => {

    try {

        const db = readDB();

        return res.json(db.consultas);

    }

    catch (err) {

        console.error("Erro ao buscar medicações:", err);

        return res.status(500).json({

            erro: "Erro ao buscar medicações."

        });

    }

});

// =========================
// ALTA
// =========================

app.post("/alta", (req, res) => {

    try {

        const db = readDB();

        if (!Array.isArray(db.altas)) {

            db.altas = [];

        }

        const alta = {

            id: Date.now(),

            ...req.body,

            createdAt: new Date().toISOString()

        };

        db.altas.push(alta);

        writeDB(db);

        return res.json(alta);

    }

    catch (err) {

        console.error("Erro na alta:", err);

        return res.status(500).json({

            erro: "Erro ao salvar alta."

        });

    }

});

// =========================
// LISTAR ALTAS
// =========================

app.get("/altas", (req, res) => {

    try {

        const db = readDB();

        return res.json(db.altas);

    }

    catch (err) {

        console.error("Erro ao buscar altas:", err);

        return res.status(500).json({

            erro: "Erro ao buscar altas."

        });

    }

});

// =========================
// ROTA PRINCIPAL
// =========================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(FRONTEND_DIR, "index.html")
    );

});

// =========================
// INICIAR SERVIDOR
// =========================

app.listen(PORT, () => {

    console.log("--------------------------------");
    console.log("🏥 Hospital Pro");
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("--------------------------------");

});
