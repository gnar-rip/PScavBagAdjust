class BackpackSpawnRateMod {
    constructor() {
      this.mod = "BackpackSpawnRateMod";
    }
  
    postDBLoad(container) {
      const { DatabaseServer } = container.resolve("DatabaseServer");
      const db = DatabaseServer.tables;
  
      // Modify backpack spawn rates here
      this.modifyBackpackSpawnRates(db);
    }
  
    modifyBackpackSpawnRates(db) {
      const scavs = db.bots.types.scav.inventory.items.Backpack;
  
      // Adjust spawn rate here (example: setting a new spawn rate)
      for (let backpack of scavs) {
        backpack.chances = 1.0; // Set the spawn chance to 50%
      }
    }
  }
  
  module.exports = new BackpackSpawnRateMod();
  