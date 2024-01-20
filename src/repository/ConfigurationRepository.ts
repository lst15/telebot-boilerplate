const nconf = require('nconf');

export class ConfigurationRepository {
    
    getConfig_byName(configName:string,key:string){
        const fileConfig = nconf.file({file: `./src/configs/${configName.toString()}.json`});
        return fileConfig.get(`${key}`)
    }

}