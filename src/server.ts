import {Web3Repository} from "./repository/Web3Repository";
import {ConfigurationRepository} from "./repository/ConfigurationRepository";
import {ContractRepository} from "./repository/ContractRepository";
import SystemConfigs from 'nconf';
import {telegram_bot} from "./deco/TelebotRouterDeco";
import {ContractController} from "./controllers/ContractController";
import {Web3Controller} from "./controllers/Web3Controller";

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

ContractRepository.initialize(
    defaultRpcConfig.factoryAddress,
    defaultRpcConfig.routerAddress,
    defaultRpcConfig.usdAddress,
    Web3Repository.wallet,
);

(async () => {

    telegram_bot.start()
    new ContractController();
    new Web3Controller();

})()

