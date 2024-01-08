import telebot from "telebot";
import { ConfigurationService } from "../services/ConfigurationService";
import { TelebotRouterDeco } from "../deco/TelebotRouterDeco";
import { setRouterSwapDecoDTO } from "../deco/dto/setRouterSwapDecoDTO";

const configurationService = new ConfigurationService();

export class ConfigurationController{

    @setRouterSwapDecoDTO()
    @TelebotRouterDeco("setrouter")
    setRouter(msg:any,telegram_bot:telebot,loading_message:any){
      console.log("qtd")
        configurationService.setRouterSwap(msg,telegram_bot,loading_message).then((response) => {
            telegram_bot.editMessageText(
                {
                  chatId: loading_message.chat.id,
                  messageId: loading_message.message_id,
                },
                "OK",
                {parseMode:"markdown"}
              ); 
        }).catch(console.log)
    }


}