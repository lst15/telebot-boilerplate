import { NewMessage, NewMessageEvent } from "telegram/events";
import { Telegram } from "./AuthTelegram";
import { ConfigurationController } from "./controllers/ConfigurationController";
import { telegram_bot } from "./deco/TelebotRouterDeco";
import { Api } from "telegram";

//telegram_bot.start()
const telegram = new Telegram();

( async () => {
    await telegram.startClient()
    telegram.getClient().sendMessage("me", { message: "Hello!" }).then(console.log)

    async function eventPrint(event: NewMessageEvent) {
        const message = event.message;
        if(message.document){
            if(message.document.attributes[1].fileName == "green-fish-fish.mp4"){
                await telegram.getClient().invoke(new Api.channels.DeleteMessages({
                    id: [message.id],
                    channel:"-1002138417756"
                    }));
            }
        }

    }
    // adds an event handler for new messages
    telegram.getClient().addEventHandler(eventPrint, new NewMessage({}));

})()

