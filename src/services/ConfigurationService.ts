import telebot from "telebot";
import { envUpdate } from "../utils/env-update";
import { env } from "../env-schema";

export class ConfigurationService {
    async setRouterSwap(msg:any,telegram_bot:telebot,loading_message:any){        
        const [command, address] = msg.text.split(" ")
        
        envUpdate([{
            key:"ROUTER",
            value:address
        }])
        env.ROUTER = address;
        
        return 200
    }
}