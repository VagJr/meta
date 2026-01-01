const Data = require("./data");

const CELL_SIZE = 0.001; // ~100m
const ORB_RADIUS = 0.00008;

function cellId(lat, lng) {
  return `${Math.floor(lat / CELL_SIZE)}:${Math.floor(lng / CELL_SIZE)}`;
}

function dist(a, b) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

const cells = {};

module.exports = {
  init(io) { this.io = io; },

  join(socket, { name, lat, lng }) {
    socket.player = {
      id: socket.id,
      name,
      lat,
      lng,
      score: 0
    };

    const cell = cellId(lat, lng);
    socket.cell = cell;
    socket.join(cell);

    if (!cells[cell]) {
      cells[cell] = {
        players: {},
        orbs: Data.spawnOrbs(cell, lat, lng),
        objects: Data.loadObjects(cell)
      };
    }

    cells[cell].players[socket.id] = socket.player;

    socket.emit("world_init", cells[cell]);
    socket.to(cell).emit("player_joined", socket.player);
  },

  move(socket, { lat, lng }) {
    if (!socket.player) return;

    socket.player.lat = lat;
    socket.player.lng = lng;

    const cell = cells[socket.cell];
    if (!cell) return;

    // 🔥 COLETA AUTOMÁTICA DE ORBES
    Object.values(cell.orbs).forEach(orb => {
      if (dist(socket.player, orb) < ORB_RADIUS) {
        delete cell.orbs[orb.id];
        socket.player.score++;
        Data.saveScore(socket.player);

        this.io.to(socket.cell).emit("orb_collected", {
          orbId: orb.id,
          player: socket.player
        });
      }
    });

    socket.to(socket.cell).emit("player_move", socket.player);
  },

  createObject(socket, obj) {
    if (!socket.player) return;

    const item = {
      id: Date.now().toString(),
      lat: obj.lat,
      lng: obj.lng,
      text: obj.text,
      author: socket.player.name
    };

    const cell = cells[socket.cell];
    cell.objects.push(item);
    Data.saveObject(socket.cell, item);

    this.io.to(socket.cell).emit("object_created", item);
  },

  leave(socket) {
    if (!socket.cell) return;
    delete cells[socket.cell]?.players[socket.id];
    socket.to(socket.cell).emit("player_left", socket.id);
  }
};
