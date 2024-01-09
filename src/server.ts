import { ConfigurationController } from "./controllers/ConfigurationController";
import { telegram_bot } from "./deco/TelebotRouterDeco";

telegram_bot.start()
new ConfigurationController()