import telebot from "telebot";
import { envUpdate } from "../utils/env-update";
import { env } from "../env-schema";
import { ConfigurationRepository } from "../repository/ConfigurationRepository";

const configurationRepository = new ConfigurationRepository()

export class ConfigurationService {
    async setRouterSwap(msg:any,telegram_bot:telebot,loading_message:any){        
        const [command, address] = msg.text.split(" ")

        envUpdate([{
            key:"ROUTER",
            value:address
        }])
        env.ROUTER = address;
        
        configurationRepository.setValue(msg.from.id,{key:"router",value:{address}})

        return 200
    }

    async saveConfig(msg:any,telegram_bot:telebot,loading_message:any){
        const [command, ...configs] = msg.text.split(/\s*-\s*/);

        const resultObjectArray: { [key: string]: { [property: string]: string } }[] = configs.map((item: { split: (arg0: RegExp) => [any, ...any[]]; }) => {
            const [key, ...properties] = item.split(/\s+/);
            const propertiesObject = properties.reduce((obj: any, property: { split: (arg0: string) => [any, any]; }) => {
              const [propertyKey, propertyValue] = property.split(':');
              return { ...obj, [propertyKey]: propertyValue };
            }, {});
          
            return { [key]: propertiesObject };
          });
          
          resultObjectArray.forEach(element => {
            const key = Object.keys(element)[0]

            configurationRepository.setValue(msg.from.id,{key:key,value:element[key]})
          });
    }   

}