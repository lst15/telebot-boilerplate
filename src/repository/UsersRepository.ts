export class UsersRepository {
    private usersContainer: {[telegram_id:number]: {[key:string]:any}} = {};

    addValueInUserContainer(telegram_id:number, container:{key:string,value:any}){

        if(!this.usersContainer[telegram_id]){
            this.usersContainer[telegram_id] = {}
        }

        this.usersContainer[telegram_id][container.key] = container.value;
        return container;
    }

    getUserContainerKey(telegram_id:number,key:string){
        return this.usersContainer[telegram_id][key];
    }

}