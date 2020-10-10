import express from "express";
import url from "url";
import ws from "ws";
import games from "./games";

// WS
export const wsServer = new ws.Server({ noServer: true });
wsServer.on("connection", (socket, req) => {
    const pathname = url.parse(req.url).pathname;
    const idMatch = /\/v2\/([^\/]+)\/(.+)/.exec(pathname);
    const gameId = idMatch ? idMatch[1] : "";
    const game = games.get(gameId);
    if (!game) {
        console.warn("Attempted to connect to unknown game", gameId, pathname);
        return socket.close(1000, `Unknown game ID ${gameId}`);
    }
    const playerId = idMatch ? idMatch[2] : "";
    if (!playerId) {
        return socket.close(1000, `Invalid player ID`);
    }
    game.addSocket(socket, playerId);

    socket.on("message", (msg) => {
        if (msg === "ping") {
            return;
        }
        game.broadcast(msg, socket);
    });
});

// Express routes
export const router = express.Router();
router.get("/create-channel/:id", (req, res) => {
    /*
    const id = req.params.id;
    if (!id) {
        return res.status(400).send({ error: `Channel ID must be set` });
    }
    if (db[id]) {
        return res.status(403).send({ error: `Channel ${id} already exists` });
    }
    db[id] = new Channel(id);*/
    res.send({});
});
router.get("/get-signaling-host/:id/:token", (_, res) => {
    const url = process.env.URL || "localhost";
    const port = process.env.PORT || 9876;
    res.send({ v: `${url === "localhost" ? "ws" : "wss"}://${url}:${port}` });
});
router.get("/get-signaling-token/:id/:token", (req, res) => {
    res.send({ v: `${req.params.id}/${req.params.token}` });
});
router.get("/get-ice-candidates/:id", (req, res) => {
    res.send({
        v: {
            iceServers: { urls: "stun:stun.l.google.com:19302" },
        },
    });
});
