const Data = require("./data");

const cells = {}; // células ativas

function getCell(lat, lng) {
    const size = 0.001; // ~100m
    return `${Math.floor(lat / size)}:${Math.floor(lng / size)}`;
}

module.exports = {
    init(io) {
        this.io = io;
    },

    joinCell(socket, { lat, lng, name }) {
        const cellId = getCell(lat, lng);
        socket.cell = cellId;
        socket.player = {
            id: socket.id,
            name,
            lat,
            lng,
            score: 0
        };

        socket.join(cellId);

        if (!cells[cellId]) {
            cells[cellId] = {
                players: {},
                objects: Data.loadObjects(cellId),
                orbs: Data.spawnOrbs(cellId)
            };
        }

        cells[cellId].players[socket.id] = socket.player;

        socket.emit("world_init", cells[cellId]);
        socket.to(cellId).emit("player_joined", socket.player);
    },

    updatePlayer(socket, { lat, lng }) {
        if (!socket.cell) return;
        socket.player.lat = lat;
        socket.player.lng = lng;

        socket.to(socket.cell).emit("player_move", socket.player);
    },

    chat(socket, text) {
        if (!socket.cell) return;
        this.io.to(socket.cell).emit("chat", {
            name: socket.player.name,
            text
        });
    },

    collectOrb(socket, orbId) {
        const cell = cells[socket.cell];
        if (!cell || !cell.orbs[orbId]) return;

        delete cell.orbs[orbId];
        socket.player.score += 1;

        Data.saveScore(socket.player);
        this.io.to(socket.cell).emit("orb_collected", {
            orbId,
            player: socket.player
        });
    },

    createObject(socket, obj) {
        const cell = cells[socket.cell];
        if (!cell) return;

        const newObj = {
            id: Date.now(),
            ...obj,
            owner: socket.player.name
        };

        cell.objects.push(newObj);
        Data.saveObject(socket.cell, newObj);

        this.io.to(socket.cell).emit("object_created", newObj);
    },

    leave(socket) {
        if (!socket.cell) return;
        delete cells[socket.cell]?.players[socket.id];
        socket.to(socket.cell).emit("player_left", socket.id);
    }
};
