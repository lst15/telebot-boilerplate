import { ConfigurationController } from "./controllers/ConfigurationController";
import { telegram_bot } from "./deco/TelebotRouterDeco";
import { UsersRepository } from "./repository/UsersRepository";

//telegram_bot.start()
const container = new UsersRepository()
container.addValueInUserContainer(1,{key:"nome",value:"leandro"})
console.log(container.getUserContainerKey(1,"nome"))
//new ConfigurationController()