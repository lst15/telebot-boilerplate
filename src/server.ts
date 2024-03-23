import {Web3Repository} from "./repository/Web3Repository";
import SystemConfigs from 'nconf';
import {telegram_bot} from "./deco/TelebotRouterDeco";
import {AuthTelegramRepository} from "./repository/AuthTelegramRepository";
import {Web3Controller} from "./controllers/Web3Controller";
import {AuthTelegramController} from "./controllers/AuthTelegramController";

const defaultRpcConfig = SystemConfigs.get("defaultNetwork")

Web3Repository.initialize(
    defaultRpcConfig.http,
    defaultRpcConfig.decimals,
    defaultRpcConfig.routerAddress,
    defaultRpcConfig.blockscan,
    defaultRpcConfig.factoryAddress,
    defaultRpcConfig.wethAddress
);

(async () => {

    await AuthTelegramRepository.initialize()

    telegram_bot.start()
    new Web3Controller();
    new AuthTelegramController();

})()

