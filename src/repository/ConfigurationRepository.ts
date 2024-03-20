import configs from 'nconf';

enum CONFIGS {
    RPC_CONFIG = "rpc.json",
}

const CONFIG_PATH:string = './src/configs/';

export class ConfigurationRepository {
    public readonly CONFIG_PATH = './src/configs/';

    static initialize(){
        configs.file("RPC_CONFIG",{file: `${CONFIG_PATH}${CONFIGS.RPC_CONFIG}`});
    }

}
