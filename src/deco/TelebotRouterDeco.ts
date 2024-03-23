// decorator.ts

import telebot from "telebot";
import { env } from "../env-schema";

export const telegram_bot = new telebot({
  token: env.TG_BOT_TOKEN,
});

function editMessage(chatId:number,messageId:number,message:string){
  telegram_bot.editMessageText({chatId,messageId},
      message,
      { parseMode: "markdown" }
  );
}

async function sendMessage(fromId:number,messageId:number,message:string){
  return await telegram_bot.sendMessage(fromId,message,{ replyToMessage: messageId });
}


export function TelebotRouterDeco(command: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (args: any) {
      return await originalMethod.call(this, args);
    };

    telegram_bot.on(`/${command}`, async (msg, props) => {
      const [, command, args] = msg.text.match(/\/(\w+)\s(.+)/) || [];

      const loading_message = await sendMessage(msg.from.id,msg.message_id,"Aguarde ...")
      const response = await descriptor.value.call(null, args);
      editMessage(loading_message.chat.id,loading_message.message_id,response.message)

      return response;
    });
  };
}
