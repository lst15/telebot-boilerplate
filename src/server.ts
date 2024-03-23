import {Web3Repository} from "./repository/Web3Repository";
import SystemConfigs from 'nconf';
import {telegram_bot} from "./deco/TelebotRouterDeco";
import {AuthTelegramRepository} from "./repository/AuthTelegramRepository";
import {Web3Controller} from "./controllers/Web3Controller";

(async () => {

    await AuthTelegramRepository.initialize()

    telegram_bot.start()
    new Web3Controller();

})()

