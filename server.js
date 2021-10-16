"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const data_1 = require("./data");
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/static', express_1.default.static('static'));
const port = 8081;
app.listen(port, () => console.log(`Le serveur est démarré sur le port ${port} !`));
app.get("/disconnect", (_, res) => {
    res.clearCookie("login");
    res.redirect("/");
});
app.get("/connect", (req, res) => {
    const login = req.query['login'];
    if (!!login) {
        res.setHeader("Set-Cookie", `login=${login}; HttpOnly`);
    }
    res.redirect("/");
});
app.get("/", (req, res) => {
    const login = req.cookies["login"];
    console.log("cookies : ", req.cookies);
    const html = (0, data_1.toHTML)(login);
    res.send(html);
});
app.get("/message", (req, res) => {
    const m = (0, data_1.getMessage)(+(req.query['id'] ?? NaN));
    if (m) {
        res.send(JSON.stringify(m));
    }
    else {
        if (typeof req.query['id'] === 'string') {
            res.status(404)
                .send(`Aucun message n'est identifié par "${req.query['id']}"`);
        }
        else {
            res.status(404)
                .send("Veuillez spécifier un paramètre id");
        }
    }
});
app.post("/message", (req, res) => {
    const data = req.body.data;
    const author = req.cookies["login"];
    const idParent = req.body.idParent;
    if (!author) {
        return res.status(401)
            .send(`Vous devez être identifié pour pouvoir poster un message`);
    }
    if (!data) {
        return res.status(400)
            .send(`Il manque dans le corp du message la clef data ou bien sa valeur est ""`);
    }
    const m = (0, data_1.createMessage)(author, data, idParent ? +idParent : undefined);
    if (m) {
        return res.redirect("/");
    }
    else {
        return res.status(400)
            .send(`Aucun message correspondant à idParent = ${idParent} n'a été trouvé`);
    }
});
app.delete("/message", (req, res) => {
    const author = req.cookies["login"];
    if (!author) {
        res.status(401)
            .send(`Vous devez être identifié pour pouvoir supprimer un message`);
    }
    else {
        const m = (0, data_1.getMessage)(+(req.query['id'] ?? NaN));
        if (m) {
            if (m.author === author) {
                (0, data_1.deleteMessage)(+(req.query['id'] ?? NaN));
                res.redirect("/");
            }
            else {
                res.status(401)
                    .send(`Vous devez être identifié en tant que ${m.author} pour pouvoir supprimer ce message`);
            }
        }
        else {
            if (typeof req.query['id'] === 'string') {
                res.status(404)
                    .send(`Aucun message n'est identifié par "${req.query['id']}"`);
            }
            else {
                res.status(404)
                    .send("Veuillez spécifier un paramètre id");
            }
        }
    }
});
app.put("/message", (req, res) => {
    const author = req.cookies["login"];
    if (!author) {
        return res.status(401)
            .send(`Vous devez être identifié pour pouvoir poster un message`);
    }
    else {
        const data = req.body.data;
        const id = req.body.id;
        if (!data) {
            return res.status(400)
                .send(`Il manque dans le corp du message la clef data ou bien sa valeur est ""`);
        }
        if (!id) {
            return res.status(400)
                .send(`Il manque dans le corp du message la clef id ou bien sa valeur est ""`);
        }
        const m = (0, data_1.getMessage)(+id);
        if (m) {
            if (m.author === author) {
                (0, data_1.updateMessage)(+id, data);
                return res.send(JSON.stringify(m));
            }
            else {
                return res.status(401)
                    .send(`Vous devez être identifié en tant que ${m.author} pour pouvoir modifier ce message`);
            }
        }
        else {
            return res.status(400)
                .send(`Aucun message correspondant à idParent = ${id} n'a été trouvé`);
        }
    }
});
