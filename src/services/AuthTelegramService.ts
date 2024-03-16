import {Api} from "telegram";
import {AuthTelegramRepository} from "../repository/AuthTelegramRepository";
import {chats} from "telegram/client";
import {EntityLike} from "telegram/define";
import channels = Api.channels;

export class AuthTelegramService {

    private async updateUsernameApi(chatId:bigInt.BigInteger, name:string):Promise<boolean | Error> {
        console.log("Calling update username chanel")

        try {
            return await AuthTelegramRepository.client.invoke(
                new Api.channels.UpdateUsername({
                    channel:chatId,
                    username:name,
                })
            );
        } catch (e) {
            await this.deleteChannelApi(chatId)
            // @ts-ignore
            console.log(e.message)
            // @ts-ignore
            return new Error(e.message.concat(" on update username channel   "))
        }
    }

    private async deleteChannelApi(chatId:bigInt.BigInteger){
        console.log("Calling delete channel api")

        try {
            return await AuthTelegramRepository.client.invoke(
                new Api.channels.DeleteChannel({
                    channel:chatId,
                })
            );
        } catch (e) {
            // @ts-ignore
            console.log(e.message)
            // @ts-ignore
            //throw new Error(e.message.concat(" on delete channel"))
        }
    }

    private async createChannelApi(title:string):Promise< Api.Updates | Error>{
        console.log("Calling create channel api")

        try {
            return await AuthTelegramRepository.client.invoke(
                new Api.channels.CreateChannel({
                    title: title,
                    about: "some string here",
                    megagroup: false,
                    forImport: true,
                    geoPoint: new Api.InputGeoPoint({
                        lat: 8.24,
                        long: 8.24,
                        accuracyRadius: 43,
                    }),
                    address: "some string here",

                })
            ) as  Api.Updates;
        } catch (e) {
            // @ts-ignore
            console.log(e.message)
            // @ts-ignore
            return new Error(e.message.concat(" on create channel"))
        }
    }

    public async createChannel(name:string){
        console.log("Creating channel")

        let nameWithSuffix:string = name + ("_ethchain")

        const createApi = await this.createChannelApi(name);
        if(createApi instanceof Error) return createApi.message;

        const updateApi = await this.updateUsernameApi(createApi.chats[0].id,nameWithSuffix)
        if(updateApi instanceof Error) return updateApi.message

        return nameWithSuffix
    }

}
