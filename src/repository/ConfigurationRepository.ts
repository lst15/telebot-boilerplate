import {Provider} from "nconf";

import configs from 'nconf';

enum CONFIGS {
    RPC_CONFIG = "rpc.json",
    CONTRACTS_CONFIG = "contracts.json",
    SOLC_CONFIG = "solc.json",
    BLOCKSCAN_CONFIG = "blockscan.json"
}

const CONFIG_PATH:string = './src/configs/';

export class ConfigurationRepository {
    public readonly CONFIG_PATH = './src/configs/';

    static initialize(){
        configs.file("RPC_CONFIG",{file: `${CONFIG_PATH}${CONFIGS.RPC_CONFIG}`});
        configs.file("CONTRACTS_CONFIG",{file: `${CONFIG_PATH}${CONFIGS.CONTRACTS_CONFIG}`});
        configs.file("SOLC_CONFIG",{file: `${CONFIG_PATH}${CONFIGS.SOLC_CONFIG}`});
        configs.file("BLOCKSCAN_CONFIG",{file: `${CONFIG_PATH}${CONFIGS.BLOCKSCAN_CONFIG}`});
    }

}
