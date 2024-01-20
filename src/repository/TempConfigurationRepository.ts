export class TempConfigurationRepository {
    private configurations: {[configName:string]: {[key:string]:any}} = {};

    setConfig_byName(configName:number, config:{key:string,value:any}){

        if(!this.configurations[configName]){
            this.configurations[configName] = {}
        }

        this.configurations[configName][config.key] = config.value;
        return config;
    }

    getConfig_byName(configName:string,key:string){
        return this.configurations[configName][key];
    }

}