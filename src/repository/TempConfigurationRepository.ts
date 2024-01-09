export class UsersRepository {
    private configurations: {[telegram_id:number]: {[key:string]:any}} = {};

    setValue(telegram_id:number, container:{key:string,value:any}){

        if(!this.configurations[telegram_id]){
            this.configurations[telegram_id] = {}
        }

        this.configurations[telegram_id][container.key] = container.value;
        return container;
    }

    getValue_byKey(telegram_id:number,key:string){
        return this.configurations[telegram_id][key];
    }

}