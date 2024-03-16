// decorator.ts

import telebot from "telebot";
import 'dotenv/config'

export const telegram_bot = new telebot({
  token: process.env.bot_token as string,
});

export function TelebotRouterDeco(command: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (args: any) {
      return await originalMethod.call(this, args);
    };

    telegram_bot.on(`/${command}`, async (msg: { text: { match: (arg0: RegExp) => never[]; }; from: { id: any; }; message_id: any; }, props: any) => {
      const [, command, args] = msg.text.match(/\/(\w+)\s(.+)/) || [];
      let response:any = {};

      const loading_message = await telegram_bot.sendMessage(
        msg.from.id,"Aguarde ...",{ replyToMessage: msg.message_id }
      );

      try {
        response = await descriptor.value.call(null, args);
      } catch (e) {
        response.message = String(e);
      }

      telegram_bot.editMessageText({
        chatId: loading_message.chat.id,
        messageId: loading_message.message_id,
      },
        response.message,
        { parseMode: "markdown"}
      );

      if(response.filePath){
        telegram_bot.sendDocument(msg.from.id, response.filePath, {
          replyToMessage: loading_message.message_id,
        });
      }

      return response;
    });
  };
}
