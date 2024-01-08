import telebot from "telebot";

export function GenericExceptionDeco() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
  
      descriptor.value = async function (msg: any,telegram_bot:telebot,loading_message:any) {      

        try {
            return await originalMethod.call(this,msg,telegram_bot,loading_message);    
        } catch (error) {
            return error;
        }
        
      };

    };
  }