const fs = require("fs");

let db = { objects: {}, scores: {} };

module.exports = {
  init() {
    if (fs.existsSync("data.json"))
      db = JSON.parse(fs.readFileSync("data.json"));
  },

  save() {
    fs.writeFileSync("data.json", JSON.stringify(db, null, 2));
  },

  spawnOrbs(cell, lat, lng) {
    const orbs = {};
    for (let i = 0; i < 6; i++) {
      const id = "orb_" + Date.now() + "_" + i;
      orbs[id] = {
        id,
        lat: lat + (Math.random() - 0.5) * 0.0004,
        lng: lng + (Math.random() - 0.5) * 0.0004
      };
    }
    return orbs;
  },

  loadObjects(cell) {
    return db.objects[cell] || [];
  },

  saveObject(cell, obj) {
    if (!db.objects[cell]) db.objects[cell] = [];
    db.objects[cell].push(obj);
    this.save();
  },

  saveScore(player) {
    db.scores[player.name] = player.score;
    this.save();
  }
};
