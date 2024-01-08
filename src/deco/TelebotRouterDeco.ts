// decorator.ts

import telebot from "telebot";
import { env } from "../env-schema";

export const telegram_bot = new telebot({
  token: env.TG_BOT_TOKEN,
});


telegram_bot.on('*', async (msg) => {
  
  if(msg.animation){
    if(msg.animation.file_unique_id == "AgADfgMAAq78JVA"){
     await telegram_bot.deleteMessage(msg.chat.id,msg.message_id)
    }
  }

});

export function TelebotRouterDeco(command: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (msg: any,telegram_bot:telebot,loading_message:any) {      
      return await originalMethod.call(this,msg,telegram_bot,loading_message);
    };

    telegram_bot.on(`/${command}`, async (msg, props) => {
      console.log(msg.text)
      let response;

      const loading_message = await telegram_bot.sendMessage(
        msg.from.id,
        "Executando ação, aguarde! (aguarde esta mensagem ser atualizada)" as any,
        { replyToMessage: msg.message_id }
      );
        
      response = await descriptor.value.call(null, msg,telegram_bot,loading_message); 

      return response;
    });
  };
}