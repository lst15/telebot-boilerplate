import { WalletController } from "./controllers/WalletController";
import { telegram_bot } from "./deco/TelebotRouterDeco";

telegram_bot.start()
new WalletController()