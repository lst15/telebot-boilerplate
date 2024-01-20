const nconf = require('nconf');

export class ConfigurationRepository {
    
    getConfig(key:string){        
        return nconf.get(`${key}`)
    }

    loadFile(configName:string){
        nconf.file({file: `./src/configs/${configName.toString()}.json`});
    }

}