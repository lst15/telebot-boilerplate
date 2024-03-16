import {AuthTelegramService} from "../services/AuthTelegramService";
import {TelebotRouterDeco} from "../deco/TelebotRouterDeco";
import {CreateChannelResponse} from "./response/authtelegram/CreateChannelResponse";

const service:AuthTelegramService = new AuthTelegramService();

export class AuthTelegramController {

    @TelebotRouterDeco("createChannel")
    async createChannel(arg:string){
        const userChannel = await service.createChannel(arg)

        const message:string = CreateChannelResponse(userChannel)
        return {message}
    }

}
