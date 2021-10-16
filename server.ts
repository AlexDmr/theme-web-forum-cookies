import express from "express";
import cookieParser from "cookie-parser";
import { createMessage, deleteMessage, getMessage, toHTML, updateMessage } from './data';

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static('static'));

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
    console.log("cookies : ", req.cookies );
    const html = toHTML( login );
    res.send( html );
});

app.get("/message", (req, res) => {
    const m = getMessage( +(req.query['id'] ?? NaN) );
    if (m) {
        res.send( JSON.stringify(m) );
    } else {
        if (typeof req.query['id'] === 'string') {
            res .status(404)
                .send(`Aucun message n'est identifié par "${req.query['id']}"`);
        } else {
            res .status(404)
                .send("Veuillez spécifier un paramètre id");
        }
    }
});

app.post("/message", (req, res) => {
    const data     = req.body.data   as string;
    const author   = req.cookies["login"]
    const idParent = req.body.idParent as string;

    if (!author) {
        return res  .status(401)
                    .send( `Vous devez être identifié pour pouvoir poster un message` );
    }
    if (!data) {
        return res  .status(400)
                    .send( `Il manque dans le corp du message la clef data ou bien sa valeur est ""` );
    }
    const m = createMessage(author, data, idParent ? +idParent : undefined);
    if (m) {
        return res  .redirect("/");
    } else {
        return res  .status(400)
                    .send( `Aucun message correspondant à idParent = ${idParent} n'a été trouvé` )
    }
});

app.delete("/message", (req, res) => {
    const author   = req.cookies["login"]
    if (!author) {
        res  .status(401)
             .send( `Vous devez être identifié pour pouvoir supprimer un message` );
    } else {
        const m = getMessage( +(req.query['id'] ?? NaN) );
        if (m) {
            if (m.author === author) {
                deleteMessage( +(req.query['id'] ?? NaN) );
                res.send( JSON.stringify(m) );
            } else {
                res .status(401)
                    .send( `Vous devez être identifié en tant que ${m.author} pour pouvoir supprimer ce message` );
            }
        } else {
            if (typeof req.query['id'] === 'string') {
                res .status(404)
                    .send(`Aucun message n'est identifié par "${req.query['id']}"`);
            } else {
                res .status(404)
                    .send("Veuillez spécifier un paramètre id");
            }
        }
    }

});

app.put("/message", (req, res) => {
    const author   = req.cookies["login"]
    if (!author) {
        return res  .status(401)
                    .send( `Vous devez être identifié pour pouvoir poster un message` );
    } else {
        const data      = req.body.data     as string;
        const id        = req.body.id       as string;
    
        if (!data) {
            return res  .status(400)
                        .send( `Il manque dans le corp du message la clef data ou bien sa valeur est ""` );
        }
        if (!id) {
            return res  .status(400)
                        .send( `Il manque dans le corp du message la clef id ou bien sa valeur est ""` );
        }
        const m = getMessage( +id );
        if (m) {
            if (m.author === author) {
                updateMessage(+id, data)
                return res  .send( JSON.stringify(m) );
            } else {
                return res  .status(401)
                            .send( `Vous devez être identifié en tant que ${m.author} pour pouvoir modifier ce message` );
            }
        } else {
            return res  .status(400)
                        .send( `Aucun message correspondant à idParent = ${id} n'a été trouvé` )
        }
    }

});
