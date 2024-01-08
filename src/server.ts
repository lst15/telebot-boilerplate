import { ConfigurationController } from "./controllers/ConfigurationController";
import { telegram_bot } from "./deco/TelegramRouterDeco";

telegram_bot.start()
new ConfigurationController()