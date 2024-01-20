import { TelebotRouterDeco } from "../deco/TelebotRouterDeco";
import { ConfigurationService } from "../services/ConfigurationService";
import { WalletService } from "../services/WalletService";

const configurationService = new ConfigurationService();
const walletService = new WalletService()

export class WalletController{
  
  constructor(){
    configurationService.loadConfigFile("wallets")
  }

  @TelebotRouterDeco("list_addresses")
  getWalletAddresses(mnemonic_byConfigName:string,quantity:number){
    return walletService.WalletGetAddresses(mnemonic_byConfigName,quantity);
  }

}