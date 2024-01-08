import telebot from "telebot";
import { ConfigurationService } from "../services/ConfigurationService";
import { TelebotRouterDeco } from "../deco/TelebotRouterDeco";
import { setRouterSwapDecoDTO } from "../deco/dto/setRouterSwapDecoDTO";
import { GenericExceptionDeco } from "../deco/exceptions/GenericExceptionDeco";

const configurationService = new ConfigurationService();

export class ConfigurationController{
                       
      @GenericExceptionDeco()
      @setRouterSwapDecoDTO()
      @TelebotRouterDeco("setrouter")
      setRouter(msg:any,telegram_bot:telebot,loading_message:any){
  
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