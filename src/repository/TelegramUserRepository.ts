import {TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
const input = require("input");
import 'dotenv/config'
import {envUpdate} from "../utils/env-update";

export class TelegramUserRepository {
    public static client:TelegramClient;

    static async initialize(){
        console.log("[Initializing] AuthTelegramRepository")
        let phoneNumber: string | Promise<string>;
        let password: string | Promise<string>;

        if(process.env.phone_number){
            phoneNumber = process.env.phone_number
        } else {
            phoneNumber = await input.text("Please enter your number: ");
            envUpdate([
                {key:"phone_number",value:phoneNumber}])
        }

        if(process.env.password){
            password = process.env.password
        } else {
            password = await input.text("Please enter your password: ");
            envUpdate([
                {key:"password",value:password}
            ])
        }

        TelegramUserRepository.client = new TelegramClient(
            new StringSession(process.env.session_hash),
            Number(process.env.api_id),
            process.env.api_hash as string  , {
                connectionRetries: 5,
            });

        await TelegramUserRepository.client.start({
            phoneNumber: async () => phoneNumber,
            password: async () => await password,
            phoneCode: async () =>
                await input.text("Please enter the code you received: "),
            onError: (err) => console.log(err),
        });

        if(process.env.session_hash === ""){
            envUpdate([
                {key:"session_hash",value:this.client.session.save()}
            ])
        }

    }

}
