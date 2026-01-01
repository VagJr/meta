const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const Meta = require("./meta");
const Data = require("./data");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

Data.init();
Meta.init(io);

io.on("connection", socket => {

  socket.on("join", data => Meta.join(socket, data));
  socket.on("move", data => Meta.move(socket, data));
  socket.on("create_object", obj => Meta.createObject(socket, obj));

  socket.on("disconnect", () => Meta.leave(socket));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("🌍 Meta AR ONLINE:", PORT)
);
