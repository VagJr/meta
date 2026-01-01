const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const Meta = require("./meta");
const Data = require("./data");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

Meta.init(io);
Data.init();

io.on("connection", socket => {
    console.log("Player conectado:", socket.id);

    socket.on("join", data => {
        Meta.joinCell(socket, data);
    });

    socket.on("move", data => {
        Meta.updatePlayer(socket, data);
    });

    socket.on("chat", msg => {
        Meta.chat(socket, msg);
    });

    socket.on("collect_orb", orbId => {
        Meta.collectOrb(socket, orbId);
    });

    socket.on("create_object", obj => {
        Meta.createObject(socket, obj);
    });

    socket.on("disconnect", () => {
        Meta.leave(socket);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🌍 Meta AR rodando na porta", PORT);
});
