import telebot from "telebot";

export function newConfigDecoDTO() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (args:any) {
      const regex =/(-\w+(\s+\w+:\w+)+)|(\w+(\s+\w+:\w+)+)/g;

      if(args){
        if(args.match(regex)) {
          
          const regex = /-(\w+)\s((\w+:\w+\s?)+)/g;

          const parsedResult = Object.fromEntries([...args.matchAll(regex)].map(match => {
            const [_, groupName, keyValuePairs] = match;
            const group = Object.fromEntries(keyValuePairs.trim().split(/\s+/).map((pair: string) => pair.split(':')));
            return [groupName, group];
          }));
          
          return await originalMethod.call(this, parsedResult);
        }
      }

      throw new Error("configuracao invalida")
  };

};
  }