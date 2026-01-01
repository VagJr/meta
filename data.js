const fs = require("fs");

let db = {
    objects: {},
    scores: {}
};

module.exports = {
    init() {
        if (fs.existsSync("data.json")) {
            db = JSON.parse(fs.readFileSync("data.json"));
        }
    },

    save() {
        fs.writeFileSync("data.json", JSON.stringify(db, null, 2));
    },

    loadObjects(cellId) {
        return db.objects[cellId] || [];
    },

    saveObject(cellId, obj) {
        if (!db.objects[cellId]) db.objects[cellId] = [];
        db.objects[cellId].push(obj);
        this.save();
    },

    spawnOrbs(cellId) {
        const orbs = {};
        for (let i = 0; i < 5; i++) {
            orbs["orb_" + i] = {
                id: "orb_" + i,
                x: Math.random() * 10,
                y: 1,
                z: Math.random() * -10
            };
        }
        return orbs;
    },

    saveScore(player) {
        db.scores[player.name] = player.score;
        this.save();
    }
};
