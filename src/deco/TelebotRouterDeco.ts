// decorator.ts

import telebot from "telebot";
import { env } from "../env-schema";

export const telegram_bot = new telebot({
  token: env.TG_BOT_TOKEN,
});

export function TelebotRouterDeco(command: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (args: any) {      
      return await originalMethod.call(this,args);
    };

    telegram_bot.on(`/${command}`, async (msg, props) => {
      let response;
      const [, command, args] = msg.text.match( /\/(\w+)\s(.+)/) || [];

      const loading_message = await telegram_bot.sendMessage(
        msg.from.id,
        "Executando ação, aguarde! (aguarde esta mensagem ser atualizada)" as any,
        { replyToMessage: msg.message_id }
      );
        
      response = await descriptor.value.call(null,args);       

      if(response instanceof Error){
        telegram_bot.editMessageText(
          {
            chatId: loading_message.chat.id,
            messageId: loading_message.message_id,
          },
          response.message,
          {parseMode:"markdown"}
        );         
      }

      return response;
    });
  };
}