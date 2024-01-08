import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { env } from "./env-schema";
const input = require("input");


export class Telegram {

    private client:TelegramClient

    constructor(){
        this.client = new TelegramClient(new StringSession(""), Number(env.TG_API_ID), env.TG_API_HASH, {
            connectionRetries: 5,
          });
    }

    async startClient(){
        await this.client.start({
            phoneNumber: async () => await input.text("Please enter your number: "),
            password: async () => await input.text("Please enter your password: "),
            phoneCode: async () =>
              await input.text("Please enter the code you received: "),
            onError: (err) => console.log(err),
          });

          this.client.session.save()
          console.log("You should now be connected.");        
    }

    getClient():TelegramClient{
        return this.client
    }

}

// const apiId = 123456;
// const apiHash = "123456abcdfg";
// const stringSession = new StringSession(""); // fill this later with the value from session.save()

// (async () => {
//     console.log("Loading interactive example...");
//     const client = new TelegramClient(stringSession, apiId, apiHash, {
//       connectionRetries: 5,
//     });
//     await client.start({
//       phoneNumber: async () => await input.text("Please enter your number: "),
//       password: async () => await input.text("Please enter your password: "),
//       phoneCode: async () =>
//         await input.text("Please enter the code you received: "),
//       onError: (err) => console.log(err),
//     });
//     console.log("You should now be connected.");
//     console.log(); // Save this string to avoid logging in again
//     await client.sendMessage("me", { message: "Hello!" });
//   })();