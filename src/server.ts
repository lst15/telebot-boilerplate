import {Web3Repository} from "./repository/Web3Repository";
import {ConfigurationRepository} from "./repository/ConfigurationRepository";
import {SolcRepository} from "./repository/SolcRepository";
import {ContractRepository} from "./repository/ContractRepository";
import SystemConfigs from 'nconf';
import {telegram_bot} from "./deco/TelebotRouterDeco";
import {AuthTelegramRepository} from "./repository/AuthTelegramRepository";
import {ContractController} from "./controllers/ContractController";
import {Web3Controller} from "./controllers/Web3Controller";
import {AuthTelegramController} from "./controllers/AuthTelegramController";

ConfigurationRepository.initialize();

const defaultRpcConfig = SystemConfigs.get("defaultNetwork")

Web3Repository.initialize(
    defaultRpcConfig.http,
    defaultRpcConfig.decimals,
    defaultRpcConfig.routerAddress,
    defaultRpcConfig.blockscan,
    defaultRpcConfig.factoryAddress,
    defaultRpcConfig.wethAddress
);
//
ContractRepository.initialize(
    defaultRpcConfig.factoryAddress,
    Web3Repository.wallet
);

SolcRepository.initialize(
    SystemConfigs.get("version")
);

(async () => {

    await AuthTelegramRepository.initialize()

    telegram_bot.start()
    new ContractController();
    new Web3Controller();
    new AuthTelegramController();

})()

