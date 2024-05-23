const { createLogger, transports, format } = require("winston");

// Define a custom logger with console output
const Logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()]
});

class BackpackSpawnRateMod {
  constructor() {
    this.mod = "BackpackSpawnRateMod";
    Logger.info(`Loading: ${this.mod}`);
  }

  postDBLoad(container) {
    try {
      const DatabaseServer = container.resolve("DatabaseServer");
      if (!DatabaseServer) {
        throw new Error("DatabaseServer is undefined");
      }

      const db = DatabaseServer.tableData;
      if (!db) {
        throw new Error("Database tableData are undefined");
      }

      const bots = db.bots;
      if (!bots) {
        throw new Error("Bots data are undefined");
      }

      // Modify backpack spawn rates for player scavs only
      this.modifyBackpackSpawnRates(bots);
    } catch (error) {
      Logger.error(`[${this.mod}] Error in postDBLoad: ${error.message}`);
    }
  }

  modifyBackpackSpawnRates(bots) {
    const type = 'cursedassault'; // Targeting only player scavs
    const botType = bots.types[type];

    if (!botType) {
      Logger.error(`[${this.mod}] Bots.types.${type} is undefined`);
      return;
    }

    const inventory = botType.inventory;
    if (!inventory) {
      Logger.error(`[${this.mod}] ${type} inventory is undefined`);
      return;
    }

    const items = inventory.items;
    if (!items) {
      Logger.error(`[${this.mod}] ${type} inventory items are undefined`);
      return;
    }

    const backpacks = items.Backpack;
    if (typeof backpacks !== 'object') {
      Logger.error(`[${this.mod}] ${type} backpacks is not an object`);
      return;
    }

    // Modify backpack values
    for (const key in backpacks) {
      backpacks[key] = 1.0; // Example: Set the spawn chance to 100%
    }

    Logger.info(`[${this.mod}] Modified backpack spawn rates for player scavs (cursedassault).`);
  }
}

// Implement the IPostDBLoadMod interface
module.exports = {
  mod: new BackpackSpawnRateMod(),
  IPostDBLoadMod: true
};













  