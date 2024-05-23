const { createLogger, transports, format } = require("winston");
const fs = require('fs');
const path = require('path');

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

class PScavBagAdjust {
  constructor() {
    this.mod = "PScavBagAdjust";
    this.config = this.loadConfig();
    Logger.info(`Loading: ${this.mod}`);
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../mod.config.json');
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        const parsedData = JSON.parse(configData);
        Logger.info(`[${this.mod}] Configuration file loaded successfully.`);
        return parsedData.settings;
      } else {
        throw new Error("Configuration file not found.");
      }
    } catch (error) {
      Logger.error(`[${this.mod}] Error loading config: ${error.message}`);
      return { playerScavBackpackSpawnRate: { default: 100 } };
    }
  }

  postDBLoad(container) {
    try {
      const DatabaseServer = container.resolve("DatabaseServer");
      const db = DatabaseServer.tableData;
      const bots = db.bots;
      const playerScavType = bots.types.cursedassault;

      if (!playerScavType) {
        throw new Error("playerScavType (cursedassault) is undefined");
      }

      const inventory = playerScavType.inventory;
      const items = inventory.items;
      const backpacks = items.Backpack;

      if (typeof backpacks !== 'object') {
        throw new Error("Backpacks is not an object");
      }

      // Modify backpack spawn rates based on config
      const spawnRate = this.config.playerScavBackpackSpawnRate.default / 100;
      let modifiedCount = 0;
      for (const key in backpacks) {
        backpacks[key] = spawnRate;
        modifiedCount++;
      }

      Logger.info(`[${this.mod}] Modified ${modifiedCount} player scav backpack spawn rates to ${spawnRate * 100}%.`);
    } catch (error) {
      Logger.error(`[${this.mod}] Error in postDBLoad: ${error.message}`);
    }
  }

  registerSettings(container) {
    try {
      Logger.info(`[${this.mod}] Attempting to register settings...`);
      const modConfig = container.resolve("ModConfig");
      modConfig.register({
        id: "PScavBagAdjust",
        name: "PScavBagAdjust",
        settings: {
          playerScavBackpackSpawnRate: {
            default: 100,
            min: 0,
            max: 100,
            step: 1,
            type: "slider",
            name: "Player Scav Backpack Spawn Rate",
            description: "Adjust the spawn rate percentage for player scav backpacks."
          }
        }
      });

      Logger.info(`[${this.mod}] Settings registered successfully.`);
    } catch (error) {
      Logger.error(`[${this.mod}] Error registering settings: ${error.message}`);
    }
  }
}

module.exports = {
  mod: new PScavBagAdjust(),
  IPostDBLoadMod: true,
  IMod: true,
  register(container) {
    Logger.info(`[${this.mod.mod}] Registering settings...`);
    this.mod.registerSettings(container);
  }
};




 