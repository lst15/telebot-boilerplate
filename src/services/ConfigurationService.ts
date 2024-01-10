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

    async saveConfig(configs:{ [key: string]: { [property: string]: string } }){
      const groups:any = Object.keys(configs)

      groups.forEach((groupName: any) => {
        configurationRepository.setValue(0,{key:groupName,value:configs[groupName]})        
      });

    }   

}