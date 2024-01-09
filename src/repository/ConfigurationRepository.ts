const nconf = require('nconf');

export class ConfigurationRepository {
    
    async setValue(telegram_id:number, attrib:{key:string,value:any}){
        const fileConfig = nconf.file({file: `./src/configs/${telegram_id.toString()}.json`});
        fileConfig.set(`${attrib.key}`, attrib.value);

        return await nconf.save();
    }

    getValue_byKey(telegram_id:number,key:string){
        const fileConfig = nconf.file({file: `./src/configs/${telegram_id.toString()}.json`});
        return fileConfig.get(`${key}`)
    }

}