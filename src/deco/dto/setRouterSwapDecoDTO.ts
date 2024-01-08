import telebot from "telebot";

export function setRouterSwapDecoDTO() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
  
      descriptor.value = async function (msg: any,telegram_bot:telebot,loading_message:any) {      
        const [command,address] = msg.text.split(" ")
        
        switch(address){
            case undefined:
                throw new Error("cade o endereco")
        }

        return await originalMethod.call(this,msg,telegram_bot,loading_message);
      };

    };
  }