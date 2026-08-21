const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");

// =========================
// DATABASE
// =========================

function defaultDB() {
    return {
        usuarios: [],
        pacientes: [],
        triagens: [],
        consultas: [],
        altas: []
    };
}

function readDB() {

    // cria db se nao existir
    if (!fs.existsSync(DB_FILE)) {

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(defaultDB(), null, 2)
        );

        return defaultDB();
    }

    const content = fs.readFileSync(DB_FILE, "utf-8");

    // arquivo vazio
    if (!content.trim()) {

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(defaultDB(), null, 2)
        );

        return defaultDB();
    }

    try {

        const data = JSON.parse(content);

        // garante arrays
        data.usuarios = data.usuarios || [];
        data.pacientes = data.pacientes || [];
        data.triagens = data.triagens || [];
        data.consultas = data.consultas || [];
        data.altas = data.altas || [];

        return data;

    } catch (err) {

        console.log("Erro no db.json");

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(defaultDB(), null, 2)
        );

        return defaultDB();
    }
}

function writeDB(data) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2)
    );
}

// =========================
// LOGIN
// =========================

app.post("/login", (req, res) => {

    try {

        const db = readDB();

        const user = db.usuarios.find(
            u =>
                u.usuario === req.body.usuario &&
                u.senha === req.body.senha
        );

        if (!user) {

            return res.status(401).json({
                erro: "Login inválido"
            });
        }

        res.json(user);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            erro: "Erro no login"
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
            createdAt: new Date()
        };

        db.pacientes.push(paciente);

        writeDB(db);

        res.json(paciente);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            erro: "Erro no atendimento"
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

        // temperatura
        if (Number(req.body.temperatura) > 39) {

            risco = "vermelho";

        } else if (Number(req.body.temperatura) >= 38) {

            risco = "amarelo";
        }

        const triagem = {

            id: Date.now(),

            nome: req.body.nome || "",

            idade: req.body.idade || "",

            temperatura: req.body.temperatura || "",

            sintomas: req.body.sintomas || "",

            alergia: req.body.alergia || "",

            risco,

            status: "aguardando_medico",

            criadoEm: new Date()
        };

        db.triagens.push(triagem);

        writeDB(db);

        res.json(triagem);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            erro: "Erro ao salvar triagem"
        });
    }
});

// =========================
// TRIAGENS
// =========================

app.get("/triagens", (req, res) => {

    try {

        const db = readDB();

        res.json(db.triagens);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            erro: "Erro ao buscar triagens"
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

            createdAt: new Date()
        };

        db.consultas.push(consulta);

        writeDB(db);

        res.json(consulta);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            erro: "Erro ao salvar consulta"
        });
    }
});

// =========================
// MEDICACOES
// =========================

app.get("/medicacoes", (req, res) => {

    try {

        const db = readDB();

        res.json(db.consultas);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            erro: "Erro ao buscar medicações"
        });
    }
}); 


app.post("/alta", (req, res) => {

    try {

        const db = readDB();

        if (!db.altas) {
            db.altas = [];
        }

        const alta = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date()
        };

        db.altas.push(alta);

        writeDB(db);

        res.json(alta);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            erro: "Erro ao salvar alta"
        });
    }
});


// =========================
// START
// =========================

const PORT = process.env.PORT
             || 3000;
app.listen(PORT, () => {
    console.log(`Porta ${PORT}`);
});
